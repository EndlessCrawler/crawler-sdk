/**
 * cache/scripts/fetch.ts — the one generic, contract-agnostic fetch script.
 *
 * Archives on-chain `tokenURI` output for every world listed in `cache/worlds.json`.
 * The fetch is the same for any ERC-721 world: the contract binding comes from the
 * `crawler-data` world (resolved by name) + `crawler-api`'s `getWorldContract`; the
 * registry only says *which* worlds to cache and where.
 *
 * Strategy (SPECS §Data pipeline item 1): missing-only, block-pinned, idempotent.
 *   - Pin one block `B` per world at the start; read everything `at` `B`
 *     (a single consistent chain snapshot).
 *   - Fetch list = on-chain `1..totalSupply` minus the tokens already *complete*
 *     on disk — a token missing ANY of its files is refetched whole, so adding a
 *     file to the layout backfills the archive on the next run.
 *   - Write `<id>.json` (tokenURI JSON, blob fields extracted) + `<id>.svg` (the
 *     decoded SVG, pretty-printed) per token; for `ec`-schema worlds also write
 *     `<id>.html` (the decoded `animation_url` player, pretty-printed), and the
 *     `.json` gains a `chamber` field — the on-chain `Crawl.ChamberData` struct
 *     via `tokenIdToCoord` → `coordToChamberData(chapter, coord,
 *     generateMaps=true)` `at` `B` — because the SVG alone does not carry the
 *     full map data. (`chamber`, not `chamberData` — the view of that name has a
 *     different, converted shape.) Stamp each token `{ block: B, fetchedAt }`.
 *   - `fetchedThroughBlock` advances to `B` on every clean run (even when nothing
 *     was fetched), so a future staleness scan starts from `B+1`.
 *   - Each on-chain read retries 3× with a 1 s wait, then aborts the run non-zero.
 *   - On-chain requests are throttled to ≤ 10 req/s (override: `CACHE_MAX_RPS`).
 *
 * RPC endpoint per world comes from its `rpcEnv` env var — **required**; the run
 * aborts up front if any is unset (no public fallback for the archive — it is
 * rate-limited and unreliable across hundreds of tokens).
 * Run: `pnpm --filter cache fetch:tokens` (or `pnpm fetch:tokens` in here).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatViewData,
  getPublicClient,
  getWorldContract,
  readTokenMetadata,
  readTotalSupply,
} from '@avante/crawler-api';
import { biToAddress, loadWorld, type World, type WorldJson } from '@avante/crawler-core';
import goerliData from '@avante/crawler-data/goerli';
import mainnetData from '@avante/crawler-data/mainnet';
import { config as loadEnv } from 'dotenv';
import * as prettier from 'prettier/standalone';
import prettierPluginHtml from 'prettier/plugins/html';

/** one registry entry — where to write, and which env var holds the RPC URL */
interface RegistryEntry {
  /** archive path under `cache/data/`, incl. the deployment (e.g. `endless-crawler/mainnet`) — `network` alone collides (sepolia is also `ethereum`) */
  readonly dataDir: string;
  readonly rpcEnv: string;
}
type Registry = Record<string, RegistryEntry>;

/** per-token provenance stamp in `_cache.json` */
interface TokenStamp {
  readonly block: string;
  readonly fetchedAt: string;
}

/** the `_cache.json` shape: a self-describing provenance + fetch-state file */
interface CacheState {
  name: string;
  network: string;
  chainId: bigint;
  contractName: string;
  contractAddress: string;
  fetchedThroughBlock: string;
  updatedAt: string;
  tokens: Record<string, TokenStamp>;
}

const HERE = fileURLToPath(new URL('.', import.meta.url));
const CACHE_ROOT = resolve(HERE, '..');
const REPO_ROOT = resolve(CACHE_ROOT, '..');
const DATA_ROOT = join(CACHE_ROOT, 'data');

// Load `.env` from the repo root, then let a cache-local `.env` override, BEFORE
// reading any env-derived config below. Missing files are a no-op; both git-ignored.
loadEnv({ path: join(REPO_ROOT, '.env') });
loadEnv({ path: join(CACHE_ROOT, '.env'), override: true });

const RETRIES = 3;
const RETRY_WAIT_MS = 1000;

// Rate limit: cap on-chain requests to stay under a public/shared RPC's ceiling.
// Override with CACHE_MAX_RPS (requests per second); default 10.
const MAX_RPS = Number(process.env.CACHE_MAX_RPS ?? 10);
const MIN_REQUEST_INTERVAL_MS = Math.ceil(1000 / MAX_RPS);

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// Pretty-print the decoded SVG for a readable, diff-friendly archive (prettier's
// html parser handles SVG). Deterministic → byte-stable across runs. Tabs/2/80 to
// match the canonical data serializer.
const formatSvg = (svg: string): Promise<string> =>
  prettier.format(svg, {
    parser: 'html',
    plugins: [prettierPluginHtml],
    useTabs: true,
    tabWidth: 2,
    printWidth: 80,
  });

// Space consecutive on-chain requests ≥ MIN_REQUEST_INTERVAL_MS apart (≤ MAX_RPS).
let lastRequestAt = 0;
const throttle = async (): Promise<void> => {
  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
};

/** throttled retry of a flaky on-chain read: 3 attempts, 1 s apart, then rethrow (aborts the run) */
const withRetry = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    await throttle();
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  ! ${label} failed (attempt ${attempt}/${RETRIES}): ${message}`);
      if (attempt === RETRIES) throw err;
      await sleep(RETRY_WAIT_MS);
    }
  }
  throw new Error('unreachable');
};

/** every world shipped by `@avante/crawler-data` (per-world subpath exports) */
const allWorlds: WorldJson[] = [mainnetData.world, goerliData.world];

/** resolve a registry key to a loaded `World`, or throw */
const resolveWorld = (name: string): World => {
  const json = allWorlds.find((w) => w.worldInfo.name === name);
  if (!json) {
    throw new Error(
      `world [${name}] is listed in worlds.json but not exported by @avante/crawler-data`,
    );
  }
  return loadWorld(json);
};

/**
 * a token's required archive files — `.json` + `.svg` for every world; `ec`-schema
 * worlds add the playable `.html` (their `.json` also embeds the on-chain struct
 * as `chamber` — a content difference presence can't see: on a `.json` *shape*
 * change, delete the affected files and re-run)
 */
const requiredFiles = (id: number, isEc: boolean): string[] =>
  isEc ? [`${id}.json`, `${id}.svg`, `${id}.html`] : [`${id}.json`, `${id}.svg`];

/**
 * the `Chapter` attribute from EC token metadata — `coordToChamberData` needs the
 * chapter number, and the tokenURI just fetched already carries it
 */
const ecChapter = (metadata: Record<string, unknown>, id: number): number => {
  const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];
  for (const entry of attributes as unknown[]) {
    if (entry === null || typeof entry !== 'object') continue;
    const { trait_type: traitType, value } = entry as Record<string, unknown>;
    if (traitType === 'Chapter' && typeof value === 'string') {
      const chapter = Number(value);
      if (Number.isInteger(chapter) && chapter >= 1 && chapter <= 255) return chapter;
    }
  }
  throw new Error(`token ${id}: metadata has no usable [Chapter] attribute`);
};

/** read `_cache.json` (its `tokens` map) if present, so prior stamps survive */
const readTokens = (dir: string): Record<string, TokenStamp> => {
  const file = join(dir, '_cache.json');
  if (!existsSync(file)) return {};
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as { tokens?: Record<string, TokenStamp> };
  return parsed.tokens ?? {};
};

const fetchWorld = async (name: string, entry: RegistryEntry, rpcUrl: string): Promise<void> => {
  const world = resolveWorld(name);
  const dir = join(DATA_ROOT, entry.dataDir);
  mkdirSync(dir, { recursive: true });

  console.log(`\n▶ ${name} (${world.network}) → cache/data/${entry.dataDir}/`);
  console.log(`  RPC: $${entry.rpcEnv}`);

  // Pin one block for a consistent snapshot across the whole run.
  const block = await withRetry('getBlockNumber', () =>
    getPublicClient(world.chainId, rpcUrl).getBlockNumber(),
  );
  const totalSupply = await withRetry('totalSupply', () =>
    readTotalSupply(world, { rpcUrl, blockNumber: block }),
  );
  console.log(`  block ${block}, totalSupply ${totalSupply}`);

  // A token is complete only when EVERY required file is on disk — a token with
  // any file missing is refetched whole (deterministic content + canonical
  // formatters make the rewrite byte-stable), so layout additions backfill.
  const isEc = world.schema === 'ec';
  const files = new Set(readdirSync(dir));
  const total = Number(totalSupply);
  const missing: number[] = [];
  for (let id = 1; id <= total; id++) {
    if (!requiredFiles(id, isEc).every((f) => files.has(f))) missing.push(id);
  }
  console.log(`  ${total - missing.length} complete on disk, ${missing.length} to fetch`);

  const contract = getWorldContract(world, { rpcUrl });
  const tokens = readTokens(dir);
  const blockStr = block.toString();

  for (const id of missing) {
    // `image` and `animation_url` are lifted out by the api — nothing to strip.
    const { metadata, svg, html } = await withRetry(`token ${id} tokenURI`, () =>
      readTokenMetadata(world, id, { rpcUrl, blockNumber: block }),
    );
    writeFileSync(join(dir, `${id}.svg`), await formatSvg(svg));

    if (isEc) {
      // The playable form — the chain's own HTML player around the same SVG.
      if (html === undefined) {
        throw new Error(`token ${id}: metadata has no animation_url data-URI`);
      }
      writeFileSync(join(dir, `${id}.html`), await formatSvg(html));

      // The on-chain chamber struct — the SVG alone does not carry the full map
      // data, so `Crawl.ChamberData` (tilemap generated), read at the same block,
      // rides in the token JSON as `chamber` (not `chamberData` — the view of
      // that name has a different, converted shape).
      const coord = await withRetry(`token ${id} tokenIdToCoord`, () =>
        contract.read.tokenIdToCoord([BigInt(id)], { blockNumber: block }),
      );
      const chamber = await withRetry(`token ${id} coordToChamberData`, () =>
        contract.read.coordToChamberData([ecChapter(metadata, id), coord, true], {
          blockNumber: block,
        }),
      );
      writeFileSync(join(dir, `${id}.json`), await formatViewData({ ...metadata, chamber }));
    } else {
      writeFileSync(join(dir, `${id}.json`), await formatViewData(metadata));
    }

    tokens[String(id)] = { block: blockStr, fetchedAt: new Date().toISOString() };
    console.log(`  ✓ token ${id}`);
  }

  // Advance the watermark on every clean run (even when nothing was fetched).
  const state: CacheState = {
    name: world.name,
    network: world.network,
    chainId: world.chainId,
    contractName: world.contractName,
    contractAddress: biToAddress(world.contractAddress),
    fetchedThroughBlock: blockStr,
    updatedAt: new Date().toISOString(),
    tokens,
  };
  writeFileSync(join(dir, '_cache.json'), await formatViewData(state));
  console.log(`  fetchedThroughBlock → ${blockStr}, ${missing.length} fetched`);
};

const main = async (): Promise<void> => {
  const registry = JSON.parse(readFileSync(join(CACHE_ROOT, 'worlds.json'), 'utf8')) as Registry;
  const names = Object.keys(registry);
  console.log(`cache fetch — ${names.length} world(s): ${names.join(', ')} (≤ ${MAX_RPS} req/s)`);

  // Pre-flight: an RPC endpoint is required per world — no public fallback for the
  // archive (it is rate-limited and unreliable across hundreds of tokens). Abort
  // up front, listing every world whose env var is unset, before any chain calls.
  const rpcUrls = new Map<string, string>();
  const missing: string[] = [];
  for (const name of names) {
    const url = process.env[registry[name].rpcEnv];
    if (url) rpcUrls.set(name, url);
    else missing.push(`${name} ($${registry[name].rpcEnv})`);
  }
  if (missing.length > 0) {
    throw new Error(`no RPC endpoint set for: ${missing.join(', ')}`);
  }

  for (const [name, rpcUrl] of rpcUrls) {
    await fetchWorld(name, registry[name], rpcUrl);
  }
  console.log('\n✔ done');
};

main().catch((err) => {
  console.error('\n✖ fetch aborted:', err instanceof Error ? err.message : err);
  process.exit(1);
});

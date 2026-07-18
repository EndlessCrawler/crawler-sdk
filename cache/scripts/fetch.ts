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
 *   - Each token's content comes from the api's **payload assembler**
 *     (`assembleTokenPayload` — the SDK's single fetch/assembly implementation):
 *     write `<id>.json` (tokenURI JSON, blob fields extracted) + `<id>.svg` (the
 *     decoded SVG, pretty-printed); for `ec`-schema worlds also `<id>.html` (the
 *     decoded `animation_url` player, pretty-printed), and the `.json` carries
 *     the assembler's embedded `chamber` field — the on-chain `Crawl.ChamberData`
 *     struct, read `at` `B` — because the SVG alone does not carry the full map
 *     data. (`chamber`, not `chamberData` — the view of that name has a
 *     different, converted shape.) Stamp each token `{ block: B, fetchedAt }`.
 *   - **Staleness pass** (SPECS §Data pipeline item 1): after the missing-only
 *     pass, compute `getInvalidatedCoords` for every token just fetched (the new
 *     mints) and refetch the affected already-cached tokens at the same block
 *     `B` — `ec`: a mint's NEWS neighbours (their doors unlock; the change is
 *     monotone); `cnc`: nothing. Coord → tokenId via the cached `chamber.coord`.
 *   - `fetchedThroughBlock` advances to `B` on every clean run (even when nothing
 *     was fetched), so a future staleness scan starts from `B+1`.
 *   - Each on-chain fetch retries 3× with a 1 s wait, then aborts the run non-zero.
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
  assembleTokenPayload,
  formatViewData,
  getPublicClient,
  readTokenMetadata,
  readTotalSupply,
} from '@avante/crawler-api';
import {
  biToAddress,
  biToBigInt,
  getInvalidatedCoords,
  getSchema,
  loadWorld,
  type World,
  type WorldJson,
} from '@avante/crawler-core';
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

// Space on-chain requests to stay ≤ MAX_RPS. `requests` reserves the budget for
// calls that fan out into several RPC reads (the ec assembler makes three).
let lastRequestAt = 0;
const throttle = async (requests: number): Promise<void> => {
  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS * requests - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
};

/** throttled retry of a flaky on-chain fetch: 3 attempts, 1 s apart, then rethrow (aborts the run) */
const withRetry = async <T>(label: string, requests: number, fn: () => Promise<T>): Promise<T> => {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    await throttle(requests);
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

/** read `_cache.json` (its `tokens` map) if present, so prior stamps survive */
const readTokens = (dir: string): Record<string, TokenStamp> => {
  const file = join(dir, '_cache.json');
  if (!existsSync(file)) return {};
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as { tokens?: Record<string, TokenStamp> };
  return parsed.tokens ?? {};
};

/**
 * coord → tokenId over the cached token JSONs (the embedded `chamber.coord`) —
 * how the staleness pass finds the already-cached token at an invalidated coord
 */
const readCoordIndex = (dir: string, total: number): Map<bigint, number> => {
  const index = new Map<bigint, number>();
  for (let id = 1; id <= total; id++) {
    const file = join(dir, `${id}.json`);
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as {
      chamber?: { coord?: string | number };
    };
    if (parsed.chamber?.coord !== undefined) index.set(biToBigInt(parsed.chamber.coord), id);
  }
  return index;
};

const fetchWorld = async (name: string, entry: RegistryEntry, rpcUrl: string): Promise<void> => {
  const world = resolveWorld(name);
  const dir = join(DATA_ROOT, entry.dataDir);
  mkdirSync(dir, { recursive: true });

  console.log(`\n▶ ${name} (${world.network}) → cache/data/${entry.dataDir}/`);
  console.log(`  RPC: $${entry.rpcEnv}`);

  // Pin one block for a consistent snapshot across the whole run.
  const block = await withRetry('getBlockNumber', 1, () =>
    getPublicClient(world.chainId, rpcUrl).getBlockNumber(),
  );
  const totalSupply = await withRetry('totalSupply', 1, () =>
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

  const tokens = readTokens(dir);
  const blockStr = block.toString();

  /**
   * fetch one token whole through the api's payload assembler — the SDK's single
   * fetch/assembly implementation — and write its archive files byte-stably;
   * returns the token's coord (`ec` — from the embedded struct) for the
   * staleness pass
   */
  const fetchToken = async (id: number): Promise<bigint | undefined> => {
    if (isEc) {
      // three RPC reads inside: tokenURI + tokenIdToCoord + coordToChamberData
      const payload = await withRetry(`token ${id} assemble`, 3, () =>
        assembleTokenPayload(world, id, { rpcUrl, blockNumber: block }),
      );
      // The playable form — the chain's own HTML player around the same SVG.
      if (payload.html === undefined) {
        throw new Error(`token ${id}: metadata has no animation_url data-URI`);
      }
      writeFileSync(join(dir, `${id}.svg`), await formatSvg(payload.svg));
      writeFileSync(join(dir, `${id}.html`), await formatSvg(payload.html));
      // The assembled metadata already embeds the on-chain struct as `chamber` —
      // the SVG alone does not carry the full map data.
      writeFileSync(join(dir, `${id}.json`), await formatViewData(payload.metadata));
      tokens[String(id)] = { block: blockStr, fetchedAt: new Date().toISOString() };
      return biToBigInt(payload.metadata.chamber.coord);
    }
    // no assembler for this schema yet — the generic tokenURI archive
    const { metadata, svg } = await withRetry(`token ${id} tokenURI`, 1, () =>
      readTokenMetadata(world, id, { rpcUrl, blockNumber: block }),
    );
    writeFileSync(join(dir, `${id}.svg`), await formatSvg(svg));
    writeFileSync(join(dir, `${id}.json`), await formatViewData(metadata));
    tokens[String(id)] = { block: blockStr, fetchedAt: new Date().toISOString() };
    return undefined;
  };

  const fetchedCoords: bigint[] = [];
  for (const id of missing) {
    const coord = await fetchToken(id);
    if (coord !== undefined) fetchedCoords.push(coord);
    console.log(`  ✓ token ${id}`);
  }

  // Staleness pass — the schema's invalidation policy, executed by the fetch:
  // the tokens just fetched (the new mints) invalidate their coordinate-schema
  // neighbours; the affected already-cached tokens are refetched whole at the
  // same pinned block (byte-stable when nothing changed on-chain).
  const schema = getSchema(world.schema);
  const invalidated = new Set<bigint>();
  for (const coord of fetchedCoords) {
    for (const neighbor of getInvalidatedCoords(schema, coord)) invalidated.add(neighbor);
  }
  if (invalidated.size > 0) {
    const justFetched = new Set(missing);
    const stale: number[] = [];
    for (const [coord, id] of readCoordIndex(dir, total)) {
      if (invalidated.has(coord) && !justFetched.has(id)) stale.push(id);
    }
    console.log(`  staleness: ${stale.length} invalidated neighbour(s) to refetch`);
    for (const id of stale.sort((a, b) => a - b)) {
      await fetchToken(id);
      console.log(`  ↻ token ${id} (neighbour of a new mint)`);
    }
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

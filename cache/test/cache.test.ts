/**
 * Invariants over the committed cache archive (SPECS §Data pipeline item 1, P4 step 6).
 *
 * For every world in `cache/worlds.json` that has been fetched:
 *   - every `<id>.json` has its sibling files — `<id>.svg`, plus `<id>.html` for
 *     `ec`-schema worlds;
 *   - token files are contiguous from 1 (`_cache.json` excluded);
 *   - no data-URI blobs survive in the token JSON (`image`/`animation_url` extracted);
 *   - every `ec` token JSON embeds its own on-chain struct as `chamber`
 *     (`tokenId` echoes the id, the generated `tilemap` is hex bytes);
 *   - `_cache.json`'s binding echo matches the world resolved from `crawler-data`.
 *
 * A world listed but not yet fetched (no network directory) is skipped — the suite
 * stays green on the plumbing commit, and asserts fully once the archive lands.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { biToAddress, loadWorld, type WorldJson } from '@avante/crawler-core';
import goerliData from '@avante/crawler-data/goerli';
import mainnetData from '@avante/crawler-data/mainnet';
import { describe, expect, it } from 'vitest';

const CACHE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA_ROOT = join(CACHE_ROOT, 'data');

interface RegistryEntry {
  readonly dataDir: string;
  readonly rpcEnv: string;
}
const registry = JSON.parse(readFileSync(join(CACHE_ROOT, 'worlds.json'), 'utf8')) as Record<
  string,
  RegistryEntry
>;

/** every string leaf, recursively — used to assert no data-URI blob remains */
const stringLeaves = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringLeaves);
  if (value !== null && typeof value === 'object')
    return Object.values(value).flatMap(stringLeaves);
  return [];
};

/** every world shipped by `@avante/crawler-data` (per-world subpath exports) */
const allWorlds: WorldJson[] = [mainnetData.world, goerliData.world];

const worldByName = (name: string): WorldJson => {
  const json = allWorlds.find((w) => w.worldInfo.name === name);
  if (!json) throw new Error(`world [${name}] not exported by @avante/crawler-data`);
  return json;
};

describe('cache archive invariants', () => {
  for (const [name, entry] of Object.entries(registry)) {
    const world = loadWorld(worldByName(name));
    const dir = join(DATA_ROOT, entry.dataDir);

    describe(`${name} (${entry.dataDir})`, () => {
      if (!existsSync(dir)) {
        it.skip('not fetched yet — run `pnpm --filter cache fetch`', () => {});
        return;
      }

      const files = readdirSync(dir);
      const jsonIds = files
        .map((f) => /^(\d+)\.json$/.exec(f))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m) => Number(m[1]))
        .sort((a, b) => a - b);

      it('has at least one token', () => {
        expect(jsonIds.length).toBeGreaterThan(0);
      });

      it('every <id>.json has a sibling <id>.svg', () => {
        for (const id of jsonIds) {
          expect(files.includes(`${id}.svg`), `token ${id} is missing its .svg`).toBe(true);
        }
      });

      if (world.schema === 'ec') {
        it('every token has its <id>.html (ec schema)', () => {
          for (const id of jsonIds) {
            expect(files.includes(`${id}.html`), `token ${id} is missing its .html`).toBe(true);
          }
        });

        it('every token JSON embeds its own generated chamber struct', () => {
          for (const id of jsonIds) {
            const parsed = JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')) as Record<
              string,
              unknown
            >;
            const chamber = parsed.chamber as Record<string, unknown> | undefined;
            expect(chamber, `token ${id} has no chamber struct`).toBeDefined();
            expect(String(chamber?.tokenId), `chamber ${id} echoes a foreign tokenId`).toBe(
              String(id),
            );
            expect(
              typeof chamber?.tilemap === 'string' && /^0x[0-9a-f]+$/i.test(chamber.tilemap),
              `chamber ${id} has no generated tilemap`,
            ).toBe(true);
          }
        });
      }

      it('token ids are contiguous from 1 (excluding _cache.json)', () => {
        expect(jsonIds).toEqual(Array.from({ length: jsonIds.length }, (_, i) => i + 1));
      });

      it('no data-URI blob survives in any token JSON', () => {
        for (const id of jsonIds) {
          const parsed: unknown = JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8'));
          for (const leaf of stringLeaves(parsed)) {
            expect(leaf.startsWith('data:'), `token ${id} still carries a data: blob`).toBe(false);
          }
        }
      });

      it('_cache.json binding echo matches the resolved world', () => {
        const state = JSON.parse(readFileSync(join(dir, '_cache.json'), 'utf8')) as {
          name: string;
          network: string;
          chainId: number | string;
          contractName: string;
          contractAddress: string;
          fetchedThroughBlock: string;
          tokens: Record<string, unknown>;
        };
        expect(state.name).toBe(world.name);
        expect(state.network).toBe(world.network);
        expect(String(state.chainId)).toBe(world.chainId.toString());
        expect(state.contractName).toBe(world.contractName);
        expect(state.contractAddress).toBe(biToAddress(world.contractAddress));
        expect(BigInt(state.fetchedThroughBlock)).toBeGreaterThan(0n);
        expect(Object.keys(state.tokens).length).toBe(jsonIds.length);
      });
    });
  }
});

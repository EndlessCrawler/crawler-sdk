'use client';

/**
 * The live path in one hook, self-contained (SPECS §`crawler-react`).
 * **Internal — not exported from the package root:** the provider's
 * `liveUpdate` prop is the only entry to the live path (only the
 * {@link LiveUpdateOptions} tuning type is public). Dynamically imports the
 * optional peer `@avante/crawler-api` (a game without live updates never loads
 * it), starts `watchMints`, assembles each mint's payload via the
 * schema-dispatched `assembleTokenPayload`, `world.import`s it plus its
 * invalidated neighbours (§Schemas), restores + prunes persisted chambers on
 * mount, and persists new imports while `persist` is on (default). Nothing is
 * injected — the SDK already knows the binding, schema, converter, and
 * assembler.
 */
import { getInvalidatedCoords, type WorldHandle } from '@avante/crawler-core';
import { useEffect, useState } from 'react';
import { useCrawlerContext } from '../context/CrawlerContext';
import { CrawlerApiUnavailableError } from '../errors';
import { persistConvertedToken, restorePersistedChambers } from '../lib/persistence';

/** the optional peer's surface, loaded lazily — a type-only reference */
type CrawlerApi = typeof import('@avante/crawler-api');

/** what `watchMints`/`assembleTokenPayload` accept — client binding + poll interval */
type LiveCallOptions = Parameters<CrawlerApi['watchMints']>[1];

/**
 * Tuning for the live path — everything else the SDK already knows. All fields
 * optional: no RPC given falls back to the api's warned public RPC.
 */
export interface LiveUpdateOptions {
  /** caller-supplied RPC endpoint for the watched worlds' chains */
  readonly rpcUrl?: string;
  /**
   * a caller-supplied viem `PublicClient` (a wagmi app reuses its configured
   * client) — typed `unknown` so `crawler-react` never depends on viem; the api
   * validates it against each world's binding
   */
  readonly client?: unknown;
  /** the mint-watcher poll interval in milliseconds (api default: one block) */
  readonly intervalMs?: number;
  /** persist live-imported chambers in localStorage (default `true`) */
  readonly persist?: boolean;
  /** narrow which registered worlds go live (default: all) */
  readonly worlds?: readonly string[];
}

/** persist one imported token's converter output (svg re-read off the world) */
const _persistImport = (world: WorldHandle, tokenId: bigint): void => {
  const chamber = world.getChamberByTokenId(tokenId);
  if (!chamber) return;
  const svg = world.hasView('tokenSvg') ? world.getTokenSvg(tokenId) : undefined;
  persistConvertedToken(world, tokenId, {
    chamberData: chamber.data,
    ...(svg === undefined ? {} : { svg }),
  });
};

/**
 * Watches the target worlds' contracts and folds new mints (and their
 * invalidated neighbours) into the `Crawler` as they happen.
 *
 * @param options live-path tuning ({@link LiveUpdateOptions}) — omit for defaults
 * @param worldName watch a single world (optional); omitted: `options.worlds`,
 *   else every registered world
 * @throws `CrawlerApiUnavailableError` (through render, so error boundaries
 *   catch it) when `@avante/crawler-api` is not installed
 */
export const useLiveWorld = (options: LiveUpdateOptions = {}, worldName?: string): void => {
  const { crawler } = useCrawlerContext();
  const [error, setError] = useState<Error>();
  if (error) throw error;

  const { rpcUrl, client, intervalMs, persist = true, worlds } = options;

  useEffect(() => {
    let cancelled = false;
    const stops: (() => void)[] = [];

    const start = async (): Promise<void> => {
      let api: CrawlerApi;
      try {
        api = await import('@avante/crawler-api');
      } catch (err) {
        setError(new CrawlerApiUnavailableError(err));
        return;
      }
      if (cancelled) return;

      const callOptions = { rpcUrl, client, intervalMs } as LiveCallOptions;
      const names = worldName !== undefined ? [worldName] : (worlds ?? crawler.worlds());
      for (const name of names) {
        const world = crawler.world(name);

        // tier 2: previously live-imported chambers, re-imported and pruned
        if (persist) restorePersistedChambers(world);

        // tier 3: new mints, plus their invalidated neighbours (live doors stay correct)
        const importToken = async (tokenId: bigint): Promise<bigint> => {
          const payload = await api.assembleTokenPayload(world.data, tokenId, callOptions);
          const chamber = world.import(tokenId, payload);
          if (persist) _persistImport(world, tokenId);
          return chamber.coord;
        };
        stops.push(
          api.watchMints(world.data, callOptions, async (tokenIds) => {
            for (const tokenId of tokenIds) {
              try {
                const coord = await importToken(tokenId);
                for (const neighborCoord of getInvalidatedCoords(world.schema, coord)) {
                  const neighbor = world.getChamber(neighborCoord);
                  if (neighbor) await importToken(neighbor.tokenId);
                }
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.warn(
                  `[crawler-react] live import of token [${tokenId}] into [${name}] failed: ${message}`,
                );
              }
            }
          }),
        );
      }
    };

    void start();
    return () => {
      cancelled = true;
      for (const stop of stops) stop();
    };
  }, [crawler, worldName, rpcUrl, client, intervalMs, persist, worlds]);
};

/**
 * The live mint watcher — poll-based (SPECS §`crawler-api`): one `totalSupply`
 * read per tick. EC token ids are sequential, so supply is a complete mint
 * signal, and polling works on any RPC — no log-filter support required; there
 * are no event-log subscriptions in v1 (neighbour re-imports cover the monotone
 * door unlocks).
 */
import type { World } from '@avante/crawler-core';
import type { ContractOptions } from './contracts';
import { readTotalSupply } from './reads';

/** the default poll interval — one mainnet block */
export const defaultWatchIntervalMs = 12_000;

/** options accepted by {@link watchMints} */
export interface WatchMintsOptions extends ContractOptions {
  /** the poll interval in milliseconds (default {@link defaultWatchIntervalMs}) */
  readonly intervalMs?: number;
}

/** called with each poll's newly minted token ids (ascending, gap-free) */
export type OnMint = (tokenIds: bigint[]) => void | Promise<void>;

/**
 * Watches a world's contract for mints by polling `totalSupply`. The first
 * poll only sets the baseline (existing tokens are the static world's job);
 * every later poll reports the token ids minted since. A failed poll warns and
 * retries on the next tick — the watcher never throws asynchronously.
 *
 * @param world the world whose contract binding to watch
 * @param options the client binding (`client`/`rpcUrl`) + the poll interval
 * @param onMint called with the new token ids, oldest first
 * @returns a stop function — clears the poll and silences in-flight results
 */
export const watchMints = (
  world: World,
  options: WatchMintsOptions,
  onMint: OnMint,
): (() => void) => {
  const intervalMs = options.intervalMs ?? defaultWatchIntervalMs;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last: bigint | undefined;

  const poll = async (): Promise<void> => {
    try {
      const supply = await readTotalSupply(world, options);
      if (stopped) return;
      if (last === undefined) {
        last = supply; // baseline — the static world covers what exists already
      } else if (supply > last) {
        const minted: bigint[] = [];
        for (let id = last + 1n; id <= supply; id++) {
          minted.push(id);
        }
        last = supply;
        await onMint(minted);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[crawler-api] watchMints poll failed for [${world.name}]: ${message}`);
    }
    if (!stopped) {
      timer = setTimeout(() => void poll(), intervalMs);
    }
  };

  void poll();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
};

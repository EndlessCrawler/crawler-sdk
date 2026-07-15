/**
 * The pluggable chamber-data tier — the seam for the three-tier chamber-source
 * model (static worlds → localStorage → on-chain), consumer-injected; core imports
 * none of the packages involved (see `SDK_SPECS.md` §Data pipeline, chamber sources).
 *
 * @remarks The interface name is provisional (`SDK_PLAN.md` glossary; finalized at
 * the surface freeze, #7). Wiring into the `Crawler`'s read path lands with the
 * live path (P8, #16) — the static tier is the world itself.
 */
import type { ChamberData } from '../chamber/chamber';
import type { WorldInfo } from '../world/types';

/**
 * One pluggable chamber-data tier. Sources are async by nature (localStorage,
 * on-chain); the static tier never goes through this interface.
 */
export interface ChamberSource {
  /**
   * @param world the world being read (its contract binding identifies the chain)
   * @param coord the chamber's coordinate
   * @returns the chamber's record, or `undefined` if this tier doesn't have it
   */
  getChamber(world: WorldInfo, coord: bigint): Promise<ChamberData | undefined>;
}

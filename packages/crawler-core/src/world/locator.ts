/**
 * Chamber locators — one resolution path for every chamber key form
 * (see `SDK_SPECS.md` §The `Crawler` client).
 */
import { type BigIntish, bi } from '../bigintish';
import { getCoordinateSchema } from '../coords/registry';
import type { Compass } from '../coords/types';
import { getSchema } from '../schema/registry';
import { getTokenCoord } from './reads';
import type { World } from './types';

/**
 * A chamber key in any form, resolved by the **first field present, in this
 * order**: `tokenId` (via the `tokenCoord` view), `coord` (the key itself),
 * `slug`, `compass` (via the coordinate library).
 */
export interface ChamberLocator {
  readonly tokenId?: BigIntish;
  readonly coord?: BigIntish;
  readonly slug?: string;
  readonly compass?: Compass;
}

/**
 * Resolves a {@link ChamberLocator} to the `ChamberData` key (the coord) —
 * first field present wins, in declaration order.
 *
 * @param world the world to resolve against (its schema names the coordinate library)
 * @param locator the chamber key, in any form
 * @returns the coord, or `undefined` when the locator resolves to nothing (an
 *   unknown tokenId, an invalid slug/compass, or an empty locator)
 * @throws {@link MissingViewError} for a `tokenId` locator when the world
 *   carries no `tokenCoord` view (the usual absent-view semantics)
 */
export const resolveCoord = (world: World, locator: ChamberLocator): bigint | undefined => {
  if (locator.tokenId !== undefined) {
    return getTokenCoord(world, locator.tokenId);
  }
  if (locator.coord !== undefined) {
    return bi.toBigInt(locator.coord);
  }
  const library = getCoordinateSchema(getSchema(world.schema).coordinateSchema);
  if (locator.slug !== undefined) {
    const coord = library.slugToCoord(locator.slug);
    return coord !== 0n ? coord : undefined;
  }
  if (locator.compass !== undefined) {
    const coord = library.compassToCoord?.(locator.compass) ?? 0n;
    return coord !== 0n ? coord : undefined;
  }
  return undefined;
};

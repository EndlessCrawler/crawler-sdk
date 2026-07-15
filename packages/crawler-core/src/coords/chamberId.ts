/**
 * `chamber-id` — the interim coordinate schema for worlds with no native
 * coordinates: the coord *is* the chamber (token) id.
 *
 * @remarks Interim rule for `cnc` (`SDK_PLAN.md` decision #14, a v1 blocker):
 * the real `cnc` coordinate mapping replaces this when specified. No compass,
 * no offset math — navigation is door-based only.
 */
import type { CoordinateSchemaLibrary } from './types';

/** The `chamber-id` library type — the minimal coordinate-schema surface. */
export interface ChamberIdLibrary extends CoordinateSchemaLibrary {
  readonly name: 'chamber-id';
}

/**
 * The `chamber-id` coordinate-schema library: coords are chamber ids (positive
 * bigints), slugs are their decimal strings, and there is no compass.
 */
export const chamberId: ChamberIdLibrary = {
  name: 'chamber-id',
  validateCoord: (coord: bigint): boolean => coord > 0n,
  coordToSlug: (coord: bigint): string | null => (coord > 0n ? coord.toString() : null),
  slugToCoord: (slug: string | null): bigint => (slug && /^[0-9]+$/.test(slug) ? BigInt(slug) : 0n),
  coordToCompass: (): null => null,
};

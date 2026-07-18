/**
 * The invalidation primitive — the one pure function behind a schema's
 * {@link InvalidationPolicy} (see `SDK_SPECS.md` §Schemas). Designed once, used
 * identically by both consumers of the policy: the cache's staleness refetch and
 * the live client's neighbour re-import.
 */
import { type BigIntish, biToBigInt } from '../bigintish';
import { getCoordinateSchema } from '../coords/registry';
import type { DataSchema } from './schema';

/**
 * The coords a newly minted chamber at `coord` invalidates, per the schema's
 * declared policy: `'neighbours'` → the coordinate library's neighbour offsets
 * (NEWS: the four cardinal neighbours); `'none'` → no coords.
 *
 * @param schema the world's schema descriptor (carries the policy)
 * @param coord the minted chamber's coordinate, in any {@link BigIntish} form
 * @returns the affected coords (empty for `'none'`, or when the coordinate
 *   schema defines no adjacency)
 */
export const getInvalidatedCoords = (schema: DataSchema, coord: BigIntish): bigint[] => {
  if (schema.invalidation === 'none') return [];
  const library = getCoordinateSchema(schema.coordinateSchema);
  return library.neighborCoords?.(biToBigInt(coord)) ?? [];
};

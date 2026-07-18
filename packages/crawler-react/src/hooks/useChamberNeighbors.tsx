'use client';

import type { Chamber, ChamberLocator, DataSchema, Door } from '@avante/crawler-core';
import { useMemo } from 'react';
import { useWorldSchema } from './useWorldSchema';

/**
 * One door of a chamber, resolved to its destination chamber — `chamber` is
 * `undefined` while the destination is unminted.
 */
export interface ChamberNeighbor<S extends DataSchema = DataSchema> {
  readonly door: Door;
  readonly chamber: Chamber<S> | undefined;
}

/**
 * The chamber's doors resolved to their destination chambers — map rendering,
 * adjacent-room preloading, and door-based navigation in one hook.
 *
 * @param locator the chamber key, in any form
 * @param worldName the world to resolve (optional — see `useWorldSchema`)
 * @returns one entry per door (empty when the chamber itself is not found) — a
 *   new array when the world merges, stable otherwise
 */
export const useChamberNeighbors = <S extends DataSchema = DataSchema>(
  locator: ChamberLocator,
  worldName?: string,
): ChamberNeighbor<S>[] => {
  const world = useWorldSchema<S>(worldName);
  const coord = world.resolveCoord(locator);
  return useMemo(() => {
    const chamber = coord === undefined ? undefined : world.getChamber(coord);
    if (!chamber) return [];
    return chamber.doors.map((door) => ({ door, chamber: world.getChamber(door.destCoord) }));
  }, [world, world.data, coord]);
};

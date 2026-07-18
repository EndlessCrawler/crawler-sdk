'use client';

import type { Chamber, DataSchema } from '@avante/crawler-core';
import { useMemo } from 'react';
import { useWorldSchema } from './useWorldSchema';

/**
 * @param worldName the world to resolve (optional — see `useWorldSchema`)
 * @returns all chambers (index/grid pages, map rendering) — a new array when
 *   the world merges, stable otherwise
 */
export const useChambers = <S extends DataSchema = DataSchema>(
  worldName?: string,
): Chamber<S>[] => {
  const world = useWorldSchema<S>(worldName);
  return useMemo(() => world.getChambers(), [world, world.data]);
};

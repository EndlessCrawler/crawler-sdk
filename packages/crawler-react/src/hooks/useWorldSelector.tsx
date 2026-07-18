'use client';

import type { World } from '@avante/crawler-core';
import { useMemo } from 'react';
import { useWorldSchema } from './useWorldSchema';

/**
 * A memoized derived read over the immutable `World` value — the escape hatch
 * for bespoke derivations. Re-runs when the world merges (the value's identity
 * changes) or the selector's identity changes — pass a stable (module-scope or
 * `useCallback`ed) selector to get merge-only re-runs.
 *
 * @param selector a pure derivation over the world value
 * @param worldName the world to resolve (optional — see `useWorldSchema`)
 * @returns the derived value, stable between merges
 */
export const useWorldSelector = <T,>(selector: (world: World) => T, worldName?: string): T => {
  const world = useWorldSchema(worldName);
  const data = world.data;
  return useMemo(() => selector(data), [selector, data]);
};

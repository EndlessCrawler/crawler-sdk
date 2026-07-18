'use client';

/**
 * The world hook — one base hook, derived aliases (SPECS §`crawler-react`):
 * `useWorldSchema<S>` carries the logic exactly once; `useWorldEC` binds
 * `typeof ec`, plain `useWorld` returns the built-in schema union. The world
 * name is optional everywhere: explicit argument → the provider's
 * `defaultWorld` → the crawler's sole registered world → a typed error.
 */
import type {
  DataSchema,
  ec,
  WorldHandle,
  WorldHandleCC,
  WorldHandleEC,
} from '@avante/crawler-core';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useCrawlerContext } from '../context/CrawlerContext';

/**
 * The stable {@link WorldHandle}, re-rendering on that world's merges (the
 * `Crawler`'s coarse world-updated signal, via `useSyncExternalStore`).
 *
 * @param worldName the world to resolve — omitted: the provider's `defaultWorld`,
 *   else the crawler's sole registered world
 * @returns the stable world handle (its `data` changes identity per merge)
 * @throws `AmbiguousWorldError` when no name resolves and there is no sole world
 * @throws `UnknownWorldError` when the resolved name is not registered
 */
export const useWorldSchema = <S extends DataSchema = DataSchema>(
  worldName?: string,
): WorldHandle<S> => {
  const { crawler, defaultWorld } = useCrawlerContext();
  const name = worldName ?? defaultWorld;
  const world = useMemo(() => crawler.world<S>(name), [crawler, name]);
  // subscribe to the coarse signal; the World value's identity changes per merge
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      crawler.subscribe((event) => {
        if (event.world === world.name) onStoreChange();
      }),
    [crawler, world],
  );
  useSyncExternalStore(
    subscribe,
    () => world.data,
    () => world.data,
  );
  return world;
};

/** {@link useWorldSchema} bound to the `ec` schema. */
export const useWorldEC = (worldName?: string): WorldHandleEC =>
  useWorldSchema<typeof ec>(worldName);

/** {@link useWorldSchema} over the built-in schema union — narrow via `world.schema`. */
export const useWorld = (worldName?: string): WorldHandleEC | WorldHandleCC =>
  useWorldSchema(worldName) as WorldHandleEC | WorldHandleCC;

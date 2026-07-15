'use client';

import type { BigIntish, Chamber, Crawler, DataSchema, WorldHandle } from '@avante/crawler-core';
import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { CrawlerContext } from '../context/CrawlerContext';

/**
 * @returns the app's {@link Crawler} container
 * @throws if used outside a `CrawlerProvider`
 */
export const useCrawler = (): Crawler => {
  const { crawler } = useContext(CrawlerContext);
  if (!crawler) {
    throw new Error('The `useCrawler` hook must be used within a `CrawlerProvider`');
  }
  return crawler;
};

/** @returns the registered world names */
export const useWorldNames = (): string[] => {
  const crawler = useCrawler();
  return useMemo(() => crawler.worlds(), [crawler]);
};

/**
 * A world handle that re-renders on the `Crawler`'s coarse "world updated"
 * signal (fired when a live merge swaps the world value).
 *
 * @param name the world's registered name
 * @returns the stable {@link WorldHandle}
 */
export const useWorld = <S extends DataSchema = DataSchema>(name: string): WorldHandle<S> => {
  const crawler = useCrawler();
  const world = useMemo(() => crawler.world<S>(name), [crawler, name]);
  // subscribe to the coarse signal; the World value's identity changes per merge
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      crawler.subscribe((event) => {
        if (event.world === name) onStoreChange();
      }),
    [crawler, name],
  );
  useSyncExternalStore(
    subscribe,
    () => world.data,
    () => world.data,
  );
  return world;
};

/**
 * @param worldName the world's registered name
 * @param coord the chamber's coordinate, in any {@link BigIntish} form
 * @returns the {@link Chamber}, or `undefined` — updates when the world merges
 */
export const useChamber = <S extends DataSchema = DataSchema>(
  worldName: string,
  coord: BigIntish | null | undefined,
): Chamber<S> | undefined => {
  const world = useWorld<S>(worldName);
  // world.data identity changes on merge, re-running the lookup
  return useMemo(
    () => (coord != null ? world.getChamber(coord) : undefined),
    [world, world.data, coord],
  );
};

'use client';

/**
 * The React bindings hold an explicit `Crawler` — no reducers, no global store,
 * no DOM event bridge. Reactivity comes from the `Crawler`'s coarse, typed
 * "world updated" subscription (see `specs/SDK_SPECS.md` §The `Crawler` client).
 *
 * Keep-lights-on shape from the SDK refactor P2 — simplified further at P8
 * (live path: localStorage chamber source + persistence land there).
 */
import type { Crawler } from '@avante/crawler-core';
import { createContext, type ReactNode } from 'react';

export interface CrawlerContextType {
  crawler: Crawler | null;
}

const CrawlerContext = createContext<CrawlerContextType>({ crawler: null });

interface CrawlerProviderProps {
  children: ReactNode;
  /** the app's `Crawler` container (create once with `createCrawler(worlds)`) */
  crawler: Crawler;
}

/** Provides the app's {@link Crawler} to the hooks. */
const CrawlerProvider = ({ children, crawler }: CrawlerProviderProps) => {
  return <CrawlerContext.Provider value={{ crawler }}>{children}</CrawlerContext.Provider>;
};

export { CrawlerContext, CrawlerProvider };

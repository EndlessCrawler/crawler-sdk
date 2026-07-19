'use client';

/**
 * The React bindings hold an explicit `Crawler` — no reducers, no global store,
 * no DOM event bridge. Reactivity comes from the `Crawler`'s coarse, typed
 * "world updated" subscription (see `specs/SDK_SPECS.md` §`crawler-react`).
 *
 * The provider stays thin: it renders context and calls the live hook — every
 * live-path mechanic lives in `useLiveWorld`, not here.
 */
import type { Crawler } from '@avante/crawler-core';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { type LiveUpdateOptions, useLiveWorld } from '../hooks/useLiveWorld';

export interface CrawlerContextType {
  crawler: Crawler | null;
  /** the world the hooks resolve to when a multi-world app omits the name */
  defaultWorld?: string;
}

const CrawlerContext = createContext<CrawlerContextType>({ crawler: null });

/** Props accepted by {@link CrawlerProvider}. */
export interface CrawlerProviderProps {
  children: ReactNode;
  /** the app's `Crawler` container (create once with `createCrawler(worlds)`) */
  crawler: Crawler;
  /** names the world the hooks resolve to when a multi-world app omits the name */
  defaultWorld?: string;
  /**
   * Zero-config live updates: `true` (all defaults) or a {@link LiveUpdateOptions}
   * tuning object. Requires the optional peer `@avante/crawler-api` (loaded
   * lazily, only on this path). Omit it and the app is fully static.
   */
  liveUpdate?: boolean | LiveUpdateOptions;
}

/** the thin live shim — mounted only when `liveUpdate` is set, below the context */
const LiveUpdater = ({ options }: { options: LiveUpdateOptions }) => {
  useLiveWorld(options);
  return null;
};

/** Provides the app's {@link Crawler} to the hooks (+ the zero-config live path). */
const CrawlerProvider = ({ children, crawler, defaultWorld, liveUpdate }: CrawlerProviderProps) => {
  const value = useMemo(() => ({ crawler, defaultWorld }), [crawler, defaultWorld]);
  return (
    <CrawlerContext.Provider value={value}>
      {liveUpdate ? <LiveUpdater options={liveUpdate === true ? {} : liveUpdate} /> : null}
      {children}
    </CrawlerContext.Provider>
  );
};

/**
 * @returns the provider's context value
 * @throws if used outside a `CrawlerProvider` — every hook reads through this
 */
export const useCrawlerContext = (): CrawlerContextType & { crawler: Crawler } => {
  const context = useContext(CrawlerContext);
  if (!context.crawler) {
    throw new Error('crawler-react hooks must be used within a `CrawlerProvider`');
  }
  return context as CrawlerContextType & { crawler: Crawler };
};

export { CrawlerProvider };

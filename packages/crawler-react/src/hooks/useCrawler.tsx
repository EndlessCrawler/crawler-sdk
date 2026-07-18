'use client';

import type { Crawler } from '@avante/crawler-core';
import { useMemo } from 'react';
import { useCrawlerContext } from '../context/CrawlerContext';

/**
 * @returns the app's {@link Crawler} container
 * @throws if used outside a `CrawlerProvider`
 */
export const useCrawler = (): Crawler => useCrawlerContext().crawler;

/** @returns the registered world names */
export const useWorldNames = (): string[] => {
  const crawler = useCrawler();
  return useMemo(() => crawler.worlds(), [crawler]);
};

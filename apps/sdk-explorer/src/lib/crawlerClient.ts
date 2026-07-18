import { createCrawler, type WorldBundle } from '@avante/crawler-core';
import goerliData from '@avante/crawler-data/goerli';
import mainnetData from '@avante/crawler-data/mainnet';

// The per-world bundles the app registers — also the server route handlers'
// source for the stored WorldJson (the /api/data/<world> payload) and the
// schema's converter (the /api/onchain routes).
export const worldBundles: readonly WorldBundle[] = [mainnetData, goerliData];

// Single shared Crawler container — explicit worlds, no global store. Module
// scope in a client component (providers) creates it exactly once per bundle.
export const crawler = createCrawler(worldBundles);

export const getWorldBundle = (name: string): WorldBundle | undefined =>
  worldBundles.find((bundle) => bundle.world.worldInfo.name === name);

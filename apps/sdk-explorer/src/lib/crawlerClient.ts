import { createCrawler } from '@avante/crawler-core';
import goerliData from '@avante/crawler-data/goerli';
import mainnetData from '@avante/crawler-data/mainnet';

// Single shared Crawler container — explicit worlds, no global store. Module
// scope in a client component (providers) creates it exactly once per bundle.
export const crawler = createCrawler([mainnetData, goerliData]);

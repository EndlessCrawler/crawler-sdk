import { createCrawler } from '@avante/crawler-core';
import { allWorlds } from '@avante/crawler-data';

// Single shared Crawler container — explicit worlds, no global store. Module
// scope in a client component (providers) creates it exactly once per bundle.
export const crawler = createCrawler(allWorlds);

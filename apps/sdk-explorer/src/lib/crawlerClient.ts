import { createClient } from '@avante/crawler-core';
import { goerliDataSet, mainnetDataSet } from '@avante/crawler-data';

// Single shared EndlessCrawler client. createClient imports the datasets into
// the process-global CrawlerModules singleton, so this must run once — module
// scope in a client component (providers) gives us exactly that.
export const crawlerClient = createClient([mainnetDataSet, goerliDataSet]);

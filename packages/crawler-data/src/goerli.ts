/**
 * The goerli per-world export (#10): the world data bundled with its schema's
 * converter, ready for `createCrawler` (see `SDK_SPECS.md` §The `Crawler` client).
 */
import type { WorldBundle, WorldJson } from '@avante/crawler-core';
import { ecConverter } from './converters/ec';
import world from './worlds/goerli.json';

/**
 * Goerli testnet — frozen as migrated (dead chain): never rebuilt, never gains a
 * `tokenSvg` view.
 */
const goerli: WorldBundle = { world: world as WorldJson, converter: ecConverter };

export default goerli;

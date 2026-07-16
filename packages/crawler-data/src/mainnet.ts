/**
 * The mainnet per-world export (#10): the world data bundled with its schema's
 * converter, ready for `createCrawler` — `world.import` gets its converter with
 * zero wiring (see `SDK_SPECS.md` §The `Crawler` client).
 */
import type { WorldBundle, WorldJson } from '@avante/crawler-core';
import { ecConverter } from './converters/ec';
import world from './worlds/mainnet.json';

/** Ethereum mainnet — the live Endless Crawler world, rebuilt from the token cache. */
const mainnet: WorldBundle = { world: world as WorldJson, converter: ecConverter };

export default mainnet;

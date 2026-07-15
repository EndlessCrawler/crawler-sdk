/**
 * Static worlds, migrated to the settled World shape (SDK refactor P2, #6).
 *
 * Interim surface: root exports. The per-world subpath exports (`…/mainnet`,
 * `…/goerli`) and the bundled per-schema converters land at P5/P6
 * (see `specs/SDK_SPECS.md` §Package map).
 */
import type { WorldJson } from '@avante/crawler-core';

import _goerli from './worlds/goerli.json';
import _mainnet from './worlds/mainnet.json';

/** Ethereum mainnet — the live Endless Crawler world. */
export const mainnetWorld = _mainnet as WorldJson;

/** Goerli testnet — frozen as migrated (dead chain); never gains a `tokenSvg` view. */
export const goerliWorld = _goerli as WorldJson;

/** All static worlds shipped by this package. */
export const allWorlds: WorldJson[] = [mainnetWorld, goerliWorld];

/**
 * Generic, zero-runtime-dependency SDK utilities. This convenience barrel re-exports
 * every module; prefer the subpaths (`@avante/crawler-utils/bi`, `/format`,
 * `/encode`, `/seeder`) so a consumer bundles only what it imports.
 *
 * @module @avante/crawler-utils
 */
export * as bi from './bi';
export { type BigIntish, type HexString, InvalidBigIntishError } from './bi';
export * from './encode';
export * from './format';
export * from './seeder';

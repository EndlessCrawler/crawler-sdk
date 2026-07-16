/**
 * The package root: the per-schema converters and their payload types (P5).
 *
 * World data ships only through the per-world subpath exports (`…/mainnet`,
 * `…/goerli`) — the root carries no world JSON, so bundles hold exactly the
 * worlds imported (#10, see `specs/SDK_SPECS.md` §Package map).
 */
export * from './converters/ec';
export { TokenConversionError } from './converters/errors';

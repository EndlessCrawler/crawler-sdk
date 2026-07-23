// bigint handling lives in @avante/crawler-utils/bi (zero-dep, the base of the SDK
// layering utils ← core ← api/data/react). Re-exported here as the `bi` namespace so
// `import { bi } from '@avante/crawler-core'` — and core's own `../bigintish` imports —
// stay unchanged.
export * as bi from '@avante/crawler-utils/bi';
export { type BigIntish, type HexString, InvalidBigIntishError } from '@avante/crawler-utils/bi';

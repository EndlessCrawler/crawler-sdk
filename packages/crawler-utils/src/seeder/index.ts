/**
 * Deterministic seed derivation — `keccak256` over a canonical string, returned
 * as a `0x`-prefixed {@link HexString}. `js-sha3` supplies Ethereum's keccak (not
 * NIST SHA3-256) and is **bundled into this chunk** at build time (a
 * devDependency, not a runtime one), so only `/seeder` consumers carry it and the
 * package stays zero-runtime-dependency.
 *
 * @module @avante/crawler-utils/seeder
 */
import { keccak256 } from 'js-sha3';
import type { BigIntish, HexString } from '../bi';
import * as bi from '../bi';

/**
 * Derives a deterministic seed by hashing its input with keccak256.
 *
 * A `string` is hashed directly. An array is reduced to a canonical string first:
 * each element to its decimal form (`BigIntish` via {@link bi.toHex}) and
 * joined with `';'` — so `[1n, 2, '3']` and the string `'1;2;3'` seed identically.
 *
 * @param values the string to hash, or the `BigIntish` values to canonicalize and hash
 * @returns the keccak256 digest as a `0x`-prefixed 64-hex-digit {@link HexString}
 * @throws `InvalidBigIntishError` if an array element is not a valid `BigIntish`
 * @example
 * ```ts
 * makeSeed([1n, 2, '3', 'salt']); // keccak256('0x1;0x2;0x3;salt'), 0x-prefixed
 * makeSeed('endless');    // keccak256('endless'), 0x-prefixed
 * ```
 */
export const makeSeed = (values: string | BigIntish[]): HexString => {
  const input =
    typeof values === 'string'
      ? values
      : values.map((v) => (bi.isBigIntish(v) ? bi.toHex(v) : v)).join(';');
  return `0x${keccak256(input)}`;
};

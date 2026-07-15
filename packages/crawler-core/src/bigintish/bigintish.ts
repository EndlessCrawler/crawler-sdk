/**
 * The `bigintish` module — the SDK's single home for bigint handling.
 *
 * A {@link BigIntish} is a value that *is* a bigint but may be represented in any of
 * four forms (`bigint`, integer `number`, decimal string, hex string) and is always
 * translatable to a `bigint`. No other core module reimplements bigint handling.
 *
 * All functions are pure and total with defined error behavior: malformed input
 * (the empty string, garbage strings, non-integer numbers) is rejected with
 * {@link InvalidBigIntishError} — never silently coerced to `0n`.
 */

/**
 * A hex string with `0x` prefix — the strict template-literal type, never plain `string`.
 *
 * JSON input is handled by load-time validation (`loadWorld` parses raw JSON into
 * typed values), never by weakening this type.
 */
export type HexString = `0x${string}`;

/**
 * A value that *is* a bigint, in any of four representations:
 * `bigint`, integer `number`, decimal string (`'123'`), or {@link HexString} (`'0x7b'`).
 *
 * The decimal-string form cannot be narrowed at the type level; it is validated at
 * runtime by {@link isBigIntish}.
 */
export type BigIntish = bigint | number | string | HexString;

/**
 * Thrown when a value cannot be interpreted as a bigint.
 *
 * @remarks `''`, whitespace, non-integer numbers, and garbage strings are all errors —
 * never silently `0n`.
 */
export class InvalidBigIntishError extends Error {
  constructor(value: unknown, reason?: string) {
    super(
      `InvalidBigIntishError: cannot interpret [${String(value)}] as a bigint${
        reason ? ` (${reason})` : ''
      }`,
    );
    this.name = 'InvalidBigIntishError';
  }
}

/** decimal digits, optional leading minus */
const _decimalPattern = /^-?[0-9]+$/;
/** 0x-prefixed hex digits (non-negative by construction) */
const _hexPattern = /^0x[0-9a-fA-F]+$/;

/**
 * @param value the value to test
 * @returns true if `value` is a `0x`-prefixed hex string with at least one hex digit
 * @example
 * ```ts
 * isHexString('0xff'); // true
 * isHexString('0x');   // false
 * isHexString('ff');   // false
 * ```
 */
export const isHexString = (value: unknown): value is HexString =>
  typeof value === 'string' && _hexPattern.test(value);

/**
 * @param value the value to test
 * @returns true if `value` is of type `bigint`
 */
export const isBigInt = (value: unknown): value is bigint => typeof value === 'bigint';

/**
 * Runtime guard for {@link BigIntish}: a `bigint`, an integer `number`,
 * a decimal string, or a hex string.
 *
 * @param value the value to test
 * @returns true if {@link toBigInt} would accept `value`
 * @example
 * ```ts
 * isBigIntish(123n);   // true
 * isBigIntish('123');  // true
 * isBigIntish('0x7b'); // true
 * isBigIntish('');     // false — never silently 0n
 * isBigIntish(1.5);    // false — not an integer
 * ```
 */
export const isBigIntish = (value: unknown): value is BigIntish => {
  if (typeof value === 'bigint') return true;
  if (typeof value === 'number') return Number.isInteger(value);
  if (typeof value === 'string') return _decimalPattern.test(value) || _hexPattern.test(value);
  return false;
};

/**
 * Converts any {@link BigIntish} to a `bigint`.
 *
 * @param value a bigint in any of the four representations
 * @returns the value as a `bigint`
 * @throws {@link InvalidBigIntishError} on malformed input (`''`, garbage strings,
 *   non-integer numbers) — never silently `0n`
 */
export const toBigInt = (value: BigIntish): bigint => {
  if (!isBigIntish(value)) {
    throw new InvalidBigIntishError(value);
  }
  return BigInt(value);
};

/**
 * Strict equality on the converted `bigint`s — immune to representation differences
 * (`'0xff'` equals `255` equals `255n`).
 *
 * @param a a bigint in any representation
 * @param b a bigint in any representation
 * @returns true if both convert to the same `bigint`
 * @throws {@link InvalidBigIntishError} if either value is malformed
 */
export const bigIntEquals = (a: BigIntish, b: BigIntish): boolean => toBigInt(a) === toBigInt(b);

/**
 * @param value a bigint in any representation
 * @returns the value as a decimal string (base 10)
 * @throws {@link InvalidBigIntishError} on malformed input
 */
export const bigIntToString = (value: BigIntish): string => toBigInt(value).toString();

/**
 * Converts a non-negative {@link BigIntish} to its canonical hex-string form.
 *
 * @param value a bigint in any representation; must be non-negative
 * @returns lowercase `0x`-prefixed hex with an even number of digits (`0x01`, not `0x1`)
 * @throws {@link InvalidBigIntishError} on malformed or negative input
 *   (the hex form is non-negative by construction)
 */
export const bigIntToHex = (value: BigIntish): HexString => {
  const converted = toBigInt(value);
  if (converted < 0n) {
    throw new InvalidBigIntishError(value, 'the hex form is non-negative');
  }
  const hex = converted.toString(16);
  return `0x${hex.length % 2 === 1 ? '0' : ''}${hex}`;
};

/**
 * Unpacks the bytes of a non-negative bigint into a `Uint8Array` (big-endian).
 *
 * @param value bytes packed inside a bigint, in any representation
 * @returns the bigint's bytes, most significant first
 * @throws {@link InvalidBigIntishError} on malformed or negative input
 */
export const bigIntToByteArray = (value: BigIntish): Uint8Array => {
  const hex = bigIntToHex(value).slice(2);
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return result;
};

/**
 * Unpacks the bytes of a non-negative bigint into a plain number array (big-endian).
 *
 * @param value bytes packed inside a bigint, in any representation
 * @returns the bigint's bytes as numbers, most significant first
 * @throws {@link InvalidBigIntishError} on malformed or negative input
 */
export const bigIntToNumberArray = (value: BigIntish): number[] =>
  Array.from(bigIntToByteArray(value));

/**
 * Packs an array of binary digits into a bigint: `[1,0,1,1,0,1]` → `0b101101n`.
 *
 * @param values array of binary digits (`0`/`1` or `false`/`true`), max length 256
 * @returns the packed bigint
 * @throws {@link RangeError} if the array is longer than 256 entries
 */
export const binaryArrayToBigInt = (values: number[] | boolean[]): bigint => {
  if (values.length > 256) {
    throw new RangeError(`binaryArrayToBigInt() array length is ${values.length}, max is 256.`);
  }
  let result = '0b0';
  for (const value of values) {
    result += value ? '1' : '0';
  }
  return BigInt(result);
};

/**
 * `serialize`/`deserialize` — a round-trippable, machine-facing JSON codec that
 * survives bigints. Where {@link formatJSON} is lossy display output, this pair is
 * lossless: bigints ride as `{ $bigint: "<decimal>" }` wrappers and come back as
 * `bigint`s. Used by `crawler-react`'s live-chamber localStorage persistence.
 */

/** the wrapper a bigint rides as through JSON */
interface BigIntWrapper {
  readonly $bigint: string;
}

const _isBigIntWrapper = (value: unknown): value is BigIntWrapper =>
  value !== null &&
  typeof value === 'object' &&
  '$bigint' in value &&
  typeof (value as BigIntWrapper).$bigint === 'string';

/**
 * Serializes a value to compact JSON, encoding every `bigint` as a
 * `{ $bigint: "<decimal>" }` wrapper so {@link deserialize} can restore it.
 *
 * @param value any JSON-serializable value, `bigint`s included
 * @returns compact JSON text (no pretty-printing — this is a machine format)
 */
export const serialize = (value: unknown): string =>
  JSON.stringify(value, (_key, entry: unknown) =>
    typeof entry === 'bigint' ? { $bigint: entry.toString() } : entry,
  );

/**
 * Parses JSON produced by {@link serialize}, restoring `{ $bigint: "…" }` wrappers
 * back to `bigint`s.
 *
 * @param text JSON text from {@link serialize}
 * @returns the parsed value with bigints restored
 * @throws `SyntaxError` if `text` is not valid JSON
 */
export const deserialize = (text: string): unknown =>
  JSON.parse(text, (_key, entry: unknown) =>
    _isBigIntWrapper(entry) ? BigInt(entry.$bigint) : entry,
  );

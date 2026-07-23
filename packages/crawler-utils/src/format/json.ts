/**
 * `formatJSON` — the SDK's canonical JSON printer. Byte-for-byte identical to
 * `prettier.format(JSON.stringify(value, bigIntReplacer), { parser: 'json',
 * useTabs: true, tabWidth: 2, printWidth: 80 })`, but with **zero dependencies**:
 * short arrays/objects stay inline, long ones break one entry per line, tab
 * indentation, a single trailing newline. Replaces Prettier as the repo's
 * canonical serializer (`crawler-api`'s `formatViewData` reimplements on it).
 *
 * The value is first normalized through `JSON.parse(JSON.stringify(value, …))` so
 * every quirk of `JSON.stringify` — dropped `undefined` object entries, `toJSON`,
 * array holes → `null` — is reproduced exactly; only the *layout* is ours.
 */
import { type Doc, fill, group, indent, line, printDoc, softline } from './doc';

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * bigint handling, lifted from the old formatter: small bigints ride as JSON
 * numbers, larger-than-safe ones as decimal strings (JSON has no bigint). Lossy
 * by design — the display serializer, not the round-trip one ({@link serialize}).
 */
const _bigIntReplacer = (_key: string, value: unknown): unknown =>
  typeof value === 'bigint' ? (value <= MAX_SAFE ? Number(value) : value.toString()) : value;

/** build the document for an already-normalized JSON value (no bigint/undefined) */
const _docFor = (value: unknown): Doc => {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Prettier prints an all-numeric array of length > 1 "concisely": many values
    // packed per line via `fill`, comma attached to each value, `line` between.
    if (value.length > 1 && value.every((entry) => typeof entry === 'number')) {
      const fillParts: Doc[] = [];
      value.forEach((entry, i) => {
        const last = i === value.length - 1;
        fillParts.push([JSON.stringify(entry), last ? '' : ',']);
        if (!last) fillParts.push(line);
      });
      return group(['[', indent([softline, fill(fillParts)]), softline, ']']);
    }
    const parts: Doc[] = [];
    value.forEach((entry, i) => {
      if (i > 0) parts.push(',', line);
      parts.push(_docFor(entry));
    });
    return group(['[', indent([softline, ...parts]), softline, ']']);
  }

  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length === 0) return '{}';
  const parts: Doc[] = [];
  keys.forEach((key, i) => {
    if (i > 0) parts.push(',', line);
    parts.push([`${JSON.stringify(key)}: `, _docFor((value as Record<string, unknown>)[key])]);
  });
  return group(['{', indent([line, ...parts]), line, '}']);
};

/**
 * Serializes a value to canonical, human-readable, diff-stable JSON — the SDK's
 * dataset format. Compact yet readable: short arrays/objects inline, long ones
 * broken one entry per line, tab-indented, `printWidth` 80, terminated by a single
 * newline. bigints display via the lossy rule above (use {@link serialize} when
 * you need to read them back).
 *
 * @param value any JSON-serializable value (bigints handled; `undefined` object
 *   entries and array holes follow `JSON.stringify` semantics)
 * @returns the formatted JSON text, ending in a newline
 * @example
 * ```ts
 * formatJSON({ doors: [1, 2, 3], name: 'S1W1' });
 * // {
 * // 	"doors": [1, 2, 3],
 * // 	"name": "S1W1"
 * // }
 * ```
 */
export const formatJSON = (value: unknown): string => {
  const normalized: unknown = JSON.parse(JSON.stringify(value, _bigIntReplacer));
  return `${printDoc(_docFor(normalized), { printWidth: 80, tabWidth: 2, useTabs: true })}\n`;
};

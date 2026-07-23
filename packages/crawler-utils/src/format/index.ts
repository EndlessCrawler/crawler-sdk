/**
 * Formatting & (de)serialization — three pairs of concerns:
 *
 * - {@link formatJSON} — lossy, human-readable, diff-stable JSON (the SDK's canonical
 *   dataset format; Prettier-JSON-byte-identical, zero-dependency)
 * - {@link serialize}/{@link deserialize} — lossless, machine-facing JSON that
 *   round-trips `bigint`s
 * - {@link formatXML} — deterministic XML/HTML/SVG re-indenter
 *
 * @module @avante/crawler-utils/format
 */
export { formatJSON } from './json';
export { deserialize, serialize } from './serialize';
export { type FormatXmlOptions, formatXML } from './xml';

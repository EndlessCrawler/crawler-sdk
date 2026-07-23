/**
 * base64 + data-URI codecs, built on cross-environment globals only (`atob`,
 * `btoa`, `TextEncoder`, `TextDecoder` — present in Node 18+ and every browser),
 * so the module carries zero dependencies and runs anywhere. Absorbs the private
 * data-URI decoder `crawler-api` used to unpack on-chain `tokenURI` blobs.
 *
 * @module @avante/crawler-utils/encode
 */

/** the binary marker in a base64 data-URI: `data:<mime>;base64,<payload>` */
const _base64Marker = ';base64,';

/** a `string` is encoded as its UTF-8 bytes; a byte array is used as-is */
const _toBytes = (input: string | Uint8Array): Uint8Array =>
  typeof input === 'string' ? new TextEncoder().encode(input) : input;

/** bytes → a binary (latin1) string, the form `btoa` expects */
const _toBinary = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return binary;
};

/**
 * Encodes UTF-8 text or raw bytes to a base64 string.
 *
 * @param input the text (encoded as UTF-8) or bytes to encode
 * @returns the base64 representation
 */
export const encodeBase64 = (input: string | Uint8Array): string =>
  btoa(_toBinary(_toBytes(input)));

/**
 * Decodes a base64 string to raw bytes.
 *
 * @param base64 the base64 text
 * @returns the decoded bytes
 */
export const decodeBase64 = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

/**
 * Decodes a base64 string to UTF-8 text.
 *
 * @param base64 the base64 text
 * @returns the decoded text, interpreted as UTF-8
 */
export const decodeBase64Text = (base64: string): string =>
  new TextDecoder().decode(decodeBase64(base64));

/** options for {@link encodeDataUri} */
export interface EncodeDataUriOptions {
  /** the MIME type; omitted → a bare `data:base64,…` / `data:,…` URI */
  readonly mime?: string;
  /** base64-encode the payload (default true); false emits the data inline */
  readonly base64?: boolean;
}

/**
 * Builds a `data:` URI from text or bytes.
 *
 * @param data the payload (text encoded as UTF-8, or raw bytes)
 * @param options the MIME type and whether to base64-encode (default true)
 * @returns a `data:<mime>;base64,<payload>` URI (or the inline form when `base64: false`)
 * @example
 * ```ts
 * encodeDataUri('<svg/>', { mime: 'image/svg+xml' });
 * // "data:image/svg+xml;base64,PHN2Zy8+"
 * ```
 */
export const encodeDataUri = (
  data: string | Uint8Array,
  options: EncodeDataUriOptions = {},
): string => {
  const mime = options.mime ?? '';
  if (options.base64 === false) {
    const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
    return `data:${mime},${encodeURIComponent(text)}`;
  }
  return `data:${mime}${_base64Marker}${encodeBase64(data)}`;
};

/**
 * Decodes a **base64** `data:` URI to UTF-8 text — the inverse of the common
 * `encodeDataUri(text, { mime })` case. Returns `undefined` for anything that is
 * not a `data:…;base64,…` URI (a plain URL, an inline non-base64 data URI, a
 * non-string), so callers can distinguish "not ours to decode" from a decode.
 *
 * @param value the candidate data-URI
 * @returns the decoded UTF-8 text, or `undefined` when `value` is not a base64 data-URI
 */
export const decodeDataUri = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.startsWith('data:')) {
    return undefined;
  }
  const start = value.indexOf(_base64Marker);
  if (start < 0) {
    return undefined;
  }
  return decodeBase64Text(value.slice(start + _base64Marker.length));
};

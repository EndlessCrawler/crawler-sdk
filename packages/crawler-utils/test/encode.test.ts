import { describe, expect, it } from 'vitest';
import {
  decodeBase64,
  decodeBase64Text,
  decodeDataUri,
  encodeBase64,
  encodeDataUri,
} from '../src/encode';

describe('encode', () => {
  it('encodeBase64 / decodeBase64Text round-trip', () => {
    expect(encodeBase64('hi')).toBe('aGk=');
    expect(decodeBase64Text('aGk=')).toBe('hi');
  });

  it('round-trips UTF-8 (multi-byte) text', () => {
    const text = 'héllo — 世界';
    expect(decodeBase64Text(encodeBase64(text))).toBe(text);
  });

  it('encodeBase64 / decodeBase64 handle raw bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 255]);
    expect(decodeBase64(encodeBase64(bytes))).toEqual(bytes);
  });

  it('encodeDataUri (base64, mime) and decodeDataUri round-trip', () => {
    const uri = encodeDataUri('<svg/>', { mime: 'image/svg+xml' });
    expect(uri).toBe('data:image/svg+xml;base64,PHN2Zy8+');
    expect(decodeDataUri(uri)).toBe('<svg/>');
  });

  it('encodeDataUri without base64 emits an inline URI', () => {
    expect(encodeDataUri('a b', { mime: 'text/plain', base64: false })).toBe(
      'data:text/plain,a%20b',
    );
  });

  it('decodeDataUri returns undefined for non-base64-data-URI input', () => {
    expect(decodeDataUri('https://example.com')).toBeUndefined();
    expect(decodeDataUri('data:text/plain,hello')).toBeUndefined();
    expect(decodeDataUri(123)).toBeUndefined();
    expect(decodeDataUri(undefined)).toBeUndefined();
  });
});

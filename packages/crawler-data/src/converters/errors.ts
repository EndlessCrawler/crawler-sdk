/**
 * Converter errors. Converters are pure and total with defined error behavior:
 * an inconsistent or malformed token payload throws — broken data never enters
 * a world.
 */

/** Thrown by a converter when a token payload is malformed or self-inconsistent. */
export class TokenConversionError extends Error {
  constructor(schema: string, tokenId: bigint, message: string) {
    super(`TokenConversionError: [${schema}] token [${tokenId}]: ${message}`);
    this.name = 'TokenConversionError';
  }
}

import { describe, expect, it } from 'vitest';
import { makeSeed } from '../src/seeder';

// the canonical keccak256 (Ethereum, not NIST SHA3) of the empty string
const KECCAK_EMPTY = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

describe('makeSeed', () => {
  it('hashes a string directly and 0x-prefixes a 32-byte digest', () => {
    const seed = makeSeed('');
    expect(seed).toBe(KECCAK_EMPTY);
    expect(seed.startsWith('0x')).toBe(true);
    expect(seed).toHaveLength(66); // 0x + 64 hex digits
  });

  it('joins array values with ";" — array and equivalent string seed identically', () => {
    expect(makeSeed([1n, 2, '3', 'salt'])).toBe(makeSeed('1;2;3'));
  });

  it('canonicalizes BigIntish elements to decimal (hex and number forms converge)', () => {
    expect(makeSeed(['0xff'])).toBe(makeSeed('255'));
    expect(makeSeed([255])).toBe(makeSeed('255'));
  });

  it('always starts with 0x for non-empty input', () => {
    expect(makeSeed('endless').startsWith('0x')).toBe(true);
    expect(makeSeed([42]).startsWith('0x')).toBe(true);
  });
});

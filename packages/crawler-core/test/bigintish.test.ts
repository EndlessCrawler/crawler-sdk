import { describe, expect, it } from 'vitest';
import {
  biEquals,
  biToAddress,
  biToByteArray,
  biToHex,
  biToNumberArray,
  biToString,
  binaryArrayToBigInt,
  CoordMax,
  InvalidBigIntishError,
  isBigInt,
  isBigIntish,
  isHexString,
  biToBigInt,
} from '../src';

// a value over 64 bits (a real mainnet coord)
const _over64 = 6277101735386680763835789423207666416120802188537744064512n;

describe('bigintish', () => {
  it('isHexString()', () => {
    // positives
    expect(isHexString('0x0')).toBe(true);
    expect(isHexString('0x00')).toBe(true);
    expect(isHexString('0xff')).toBe(true);
    expect(isHexString('0xFF')).toBe(true);
    expect(isHexString('0xDeadBeef')).toBe(true);
    expect(isHexString(`0x${_over64.toString(16)}`)).toBe(true);
    // negatives
    expect(isHexString('0x')).toBe(false);
    expect(isHexString('ff')).toBe(false);
    expect(isHexString('0xgg')).toBe(false);
    expect(isHexString('-0x1')).toBe(false); // hex form is non-negative
    expect(isHexString('0x 1')).toBe(false);
    expect(isHexString('')).toBe(false);
    expect(isHexString(255)).toBe(false);
    expect(isHexString(255n)).toBe(false);
    expect(isHexString(null)).toBe(false);
    expect(isHexString(undefined)).toBe(false);
  });

  it('isBigIntish() — all four representations', () => {
    // bigint
    expect(isBigIntish(0n)).toBe(true);
    expect(isBigIntish(-1n)).toBe(true);
    expect(isBigIntish(_over64)).toBe(true);
    // integer number
    expect(isBigIntish(0)).toBe(true);
    expect(isBigIntish(-42)).toBe(true);
    expect(isBigIntish(Number.MAX_SAFE_INTEGER)).toBe(true);
    // decimal string
    expect(isBigIntish('0')).toBe(true);
    expect(isBigIntish('-42')).toBe(true);
    expect(isBigIntish(_over64.toString())).toBe(true);
    // hex string
    expect(isBigIntish('0x0')).toBe(true);
    expect(isBigIntish('0xff')).toBe(true);
    // malformed — never silently 0n
    expect(isBigIntish('')).toBe(false);
    expect(isBigIntish(' ')).toBe(false);
    expect(isBigIntish(' 1')).toBe(false);
    expect(isBigIntish('1 ')).toBe(false);
    expect(isBigIntish('1.5')).toBe(false);
    expect(isBigIntish('abc')).toBe(false);
    expect(isBigIntish('0x')).toBe(false);
    expect(isBigIntish('0xgg')).toBe(false);
    expect(isBigIntish(1.5)).toBe(false);
    expect(isBigIntish(Number.NaN)).toBe(false);
    expect(isBigIntish(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isBigIntish(null)).toBe(false);
    expect(isBigIntish(undefined)).toBe(false);
    expect(isBigIntish({})).toBe(false);
    expect(isBigIntish([])).toBe(false);
    expect(isBigIntish(true)).toBe(false);
  });

  it('isBigInt()', () => {
    expect(isBigInt(0n)).toBe(true);
    expect(isBigInt(0)).toBe(false);
    expect(isBigInt('0')).toBe(false);
  });

  it('biToBigInt() — conversions and round-trips', () => {
    // zero, all four forms
    expect(biToBigInt(0)).toBe(0n);
    expect(biToBigInt(0n)).toBe(0n);
    expect(biToBigInt('0')).toBe(0n);
    expect(biToBigInt('0x0')).toBe(0n);
    expect(biToBigInt('0x00')).toBe(0n);
    // one, all four forms (odd-length hex accepted)
    expect(biToBigInt(1)).toBe(1n);
    expect(biToBigInt(1n)).toBe(1n);
    expect(biToBigInt('1')).toBe(1n);
    expect(biToBigInt('0x1')).toBe(1n);
    expect(biToBigInt('0x01')).toBe(1n);
    // negatives (decimal forms only)
    expect(biToBigInt(-1)).toBe(-1n);
    expect(biToBigInt('-1')).toBe(-1n);
    expect(biToBigInt(-1n)).toBe(-1n);
    // larger values
    expect(biToBigInt('0xff')).toBe(255n);
    expect(biToBigInt('0x100')).toBe(256n);
    expect(biToBigInt('0x0100')).toBe(256n);
    expect(biToBigInt('0xffffffffffffffff')).toBe(CoordMax);
    // over 64 bits, round-trips between representations
    expect(biToBigInt(_over64.toString())).toBe(_over64);
    expect(biToBigInt(`0x${_over64.toString(16)}`)).toBe(_over64);
    expect(biToBigInt(biToString(_over64))).toBe(_over64);
    expect(biToBigInt(biToHex(_over64))).toBe(_over64);
  });

  it('biToBigInt() — rejects malformed input', () => {
    expect(() => biToBigInt('')).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt(' ')).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt('abc')).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt('0x')).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt('0xgg')).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt('1.5')).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt(1.5)).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt(Number.NaN)).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt(null as unknown as string)).toThrow(InvalidBigIntishError);
    expect(() => biToBigInt(undefined as unknown as string)).toThrow(InvalidBigIntishError);
  });

  it('biEquals()', () => {
    // representation-immune equality
    expect(biEquals(255, '0xff')).toBe(true);
    expect(biEquals('255', 255n)).toBe(true);
    expect(biEquals('0xFF', '0xff')).toBe(true);
    expect(biEquals(0, '0x00')).toBe(true);
    expect(biEquals(_over64, _over64.toString())).toBe(true);
    expect(biEquals(1, 2)).toBe(false);
    expect(biEquals(-1, 1)).toBe(false);
    // malformed input is an error on either side
    expect(() => biEquals('', 0)).toThrow(InvalidBigIntishError);
    expect(() => biEquals(0, '')).toThrow(InvalidBigIntishError);
  });

  it('biToString()', () => {
    expect(biToString(255)).toBe('255');
    expect(biToString('0xff')).toBe('255');
    expect(biToString(-1)).toBe('-1');
    expect(biToString(_over64)).toBe(_over64.toString());
  });

  it('biToHex() — even-length lowercase, rejects negatives', () => {
    expect(biToHex(0)).toBe('0x00');
    expect(biToHex(0n)).toBe('0x00');
    expect(biToHex('0')).toBe('0x00');
    expect(biToHex('0x0')).toBe('0x00');
    expect(biToHex('0x000')).toBe('0x00');
    expect(biToHex(1)).toBe('0x01');
    expect(biToHex('0x1')).toBe('0x01');
    expect(biToHex('0x0001')).toBe('0x01');
    expect(biToHex(255n)).toBe('0xff');
    expect(biToHex(256n)).toBe('0x0100');
    expect(biToHex('0xFF')).toBe('0xff');
    expect(biToHex(CoordMax)).toBe('0xffffffffffffffff');
    // hex form is non-negative
    expect(() => biToHex(-1)).toThrow(InvalidBigIntishError);
    expect(() => biToHex(-1n)).toThrow(InvalidBigIntishError);
  });

  it('biToAddress() — lowercase 20-byte padded hex', () => {
    const address = '0x8E70b94C57b0CBC9807c0F58Bc251f4cD96AcDb0'; // CrawlerToken mainnet
    const canonical = address.toLowerCase();
    // all four representations converge on the canonical form
    expect(biToAddress(address)).toBe(canonical);
    expect(biToAddress(canonical)).toBe(canonical);
    expect(biToAddress(biToBigInt(address))).toBe(canonical);
    expect(biToAddress(biToBigInt(address).toString())).toBe(canonical);
    // zero-padded to 40 digits
    expect(biToAddress(0)).toBe(`0x${'0'.repeat(40)}`);
    expect(biToAddress(1)).toBe(`0x${'0'.repeat(39)}1`);
    expect(biToAddress((1n << 160n) - 1n)).toBe(`0x${'f'.repeat(40)}`);
    // an address fits 20 bytes
    expect(() => biToAddress(1n << 160n)).toThrow(InvalidBigIntishError);
    expect(() => biToAddress(-1)).toThrow(InvalidBigIntishError);
  });

  it('biToByteArray() / biToNumberArray()', () => {
    expect(biToByteArray(0)).toEqual(new Uint8Array([0]));
    expect(biToByteArray(1)).toEqual(new Uint8Array([1]));
    expect(biToByteArray('0x0001')).toEqual(new Uint8Array([1]));
    expect(biToByteArray('0x010203')).toEqual(new Uint8Array([1, 2, 3]));
    expect(biToByteArray(255n)).toEqual(new Uint8Array([255]));
    expect(biToByteArray(256n)).toEqual(new Uint8Array([1, 0]));
    expect(biToByteArray(CoordMax)).toEqual(
      new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
    );
    expect(biToNumberArray('0x010201')).toEqual([1, 2, 1]);
  });

  it('binaryArrayToBigInt()', () => {
    expect(binaryArrayToBigInt([])).toBe(0n);
    expect(binaryArrayToBigInt([1])).toBe(1n);
    expect(binaryArrayToBigInt([1, 0, 1, 1, 0, 1])).toBe(0b101101n);
    expect(binaryArrayToBigInt([true, false, true])).toBe(0b101n);
    expect(binaryArrayToBigInt(new Array(256).fill(1))).toBe((1n << 256n) - 1n);
    expect(() => binaryArrayToBigInt(new Array(257).fill(0))).toThrow(RangeError);
  });
});

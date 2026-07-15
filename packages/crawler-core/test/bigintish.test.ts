import { describe, expect, it } from 'vitest';
import {
  bigIntEquals,
  bigIntToByteArray,
  bigIntToHex,
  bigIntToNumberArray,
  bigIntToString,
  binaryArrayToBigInt,
  CoordMax,
  InvalidBigIntishError,
  isBigInt,
  isBigIntish,
  isHexString,
  toBigInt,
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

  it('toBigInt() — conversions and round-trips', () => {
    // zero, all four forms
    expect(toBigInt(0)).toBe(0n);
    expect(toBigInt(0n)).toBe(0n);
    expect(toBigInt('0')).toBe(0n);
    expect(toBigInt('0x0')).toBe(0n);
    expect(toBigInt('0x00')).toBe(0n);
    // one, all four forms (odd-length hex accepted)
    expect(toBigInt(1)).toBe(1n);
    expect(toBigInt(1n)).toBe(1n);
    expect(toBigInt('1')).toBe(1n);
    expect(toBigInt('0x1')).toBe(1n);
    expect(toBigInt('0x01')).toBe(1n);
    // negatives (decimal forms only)
    expect(toBigInt(-1)).toBe(-1n);
    expect(toBigInt('-1')).toBe(-1n);
    expect(toBigInt(-1n)).toBe(-1n);
    // larger values
    expect(toBigInt('0xff')).toBe(255n);
    expect(toBigInt('0x100')).toBe(256n);
    expect(toBigInt('0x0100')).toBe(256n);
    expect(toBigInt('0xffffffffffffffff')).toBe(CoordMax);
    // over 64 bits, round-trips between representations
    expect(toBigInt(_over64.toString())).toBe(_over64);
    expect(toBigInt(`0x${_over64.toString(16)}`)).toBe(_over64);
    expect(toBigInt(bigIntToString(_over64))).toBe(_over64);
    expect(toBigInt(bigIntToHex(_over64))).toBe(_over64);
  });

  it('toBigInt() — rejects malformed input', () => {
    expect(() => toBigInt('')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt(' ')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt('abc')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt('0x')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt('0xgg')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt('1.5')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt(1.5)).toThrow(InvalidBigIntishError);
    expect(() => toBigInt(Number.NaN)).toThrow(InvalidBigIntishError);
    expect(() => toBigInt(null as unknown as string)).toThrow(InvalidBigIntishError);
    expect(() => toBigInt(undefined as unknown as string)).toThrow(InvalidBigIntishError);
  });

  it('bigIntEquals()', () => {
    // representation-immune equality
    expect(bigIntEquals(255, '0xff')).toBe(true);
    expect(bigIntEquals('255', 255n)).toBe(true);
    expect(bigIntEquals('0xFF', '0xff')).toBe(true);
    expect(bigIntEquals(0, '0x00')).toBe(true);
    expect(bigIntEquals(_over64, _over64.toString())).toBe(true);
    expect(bigIntEquals(1, 2)).toBe(false);
    expect(bigIntEquals(-1, 1)).toBe(false);
    // malformed input is an error on either side
    expect(() => bigIntEquals('', 0)).toThrow(InvalidBigIntishError);
    expect(() => bigIntEquals(0, '')).toThrow(InvalidBigIntishError);
  });

  it('bigIntToString()', () => {
    expect(bigIntToString(255)).toBe('255');
    expect(bigIntToString('0xff')).toBe('255');
    expect(bigIntToString(-1)).toBe('-1');
    expect(bigIntToString(_over64)).toBe(_over64.toString());
  });

  it('bigIntToHex() — even-length lowercase, rejects negatives', () => {
    expect(bigIntToHex(0)).toBe('0x00');
    expect(bigIntToHex(0n)).toBe('0x00');
    expect(bigIntToHex('0')).toBe('0x00');
    expect(bigIntToHex('0x0')).toBe('0x00');
    expect(bigIntToHex('0x000')).toBe('0x00');
    expect(bigIntToHex(1)).toBe('0x01');
    expect(bigIntToHex('0x1')).toBe('0x01');
    expect(bigIntToHex('0x0001')).toBe('0x01');
    expect(bigIntToHex(255n)).toBe('0xff');
    expect(bigIntToHex(256n)).toBe('0x0100');
    expect(bigIntToHex('0xFF')).toBe('0xff');
    expect(bigIntToHex(CoordMax)).toBe('0xffffffffffffffff');
    // hex form is non-negative
    expect(() => bigIntToHex(-1)).toThrow(InvalidBigIntishError);
    expect(() => bigIntToHex(-1n)).toThrow(InvalidBigIntishError);
  });

  it('bigIntToByteArray() / bigIntToNumberArray()', () => {
    expect(bigIntToByteArray(0)).toEqual(new Uint8Array([0]));
    expect(bigIntToByteArray(1)).toEqual(new Uint8Array([1]));
    expect(bigIntToByteArray('0x0001')).toEqual(new Uint8Array([1]));
    expect(bigIntToByteArray('0x010203')).toEqual(new Uint8Array([1, 2, 3]));
    expect(bigIntToByteArray(255n)).toEqual(new Uint8Array([255]));
    expect(bigIntToByteArray(256n)).toEqual(new Uint8Array([1, 0]));
    expect(bigIntToByteArray(CoordMax)).toEqual(
      new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
    );
    expect(bigIntToNumberArray('0x010201')).toEqual([1, 2, 1]);
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

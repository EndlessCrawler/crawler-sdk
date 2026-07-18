import { describe, expect, it } from 'vitest';
import { bi, CoordMax, InvalidBigIntishError } from '../src';

// a value over 64 bits (a real mainnet coord)
const _over64 = 6277101735386680763835789423207666416120802188537744064512n;

describe('bigintish', () => {
  it('bi.isHexString()', () => {
    // positives
    expect(bi.isHexString('0x0')).toBe(true);
    expect(bi.isHexString('0x00')).toBe(true);
    expect(bi.isHexString('0xff')).toBe(true);
    expect(bi.isHexString('0xFF')).toBe(true);
    expect(bi.isHexString('0xDeadBeef')).toBe(true);
    expect(bi.isHexString(`0x${_over64.toString(16)}`)).toBe(true);
    // negatives
    expect(bi.isHexString('0x')).toBe(false);
    expect(bi.isHexString('ff')).toBe(false);
    expect(bi.isHexString('0xgg')).toBe(false);
    expect(bi.isHexString('-0x1')).toBe(false); // hex form is non-negative
    expect(bi.isHexString('0x 1')).toBe(false);
    expect(bi.isHexString('')).toBe(false);
    expect(bi.isHexString(255)).toBe(false);
    expect(bi.isHexString(255n)).toBe(false);
    expect(bi.isHexString(null)).toBe(false);
    expect(bi.isHexString(undefined)).toBe(false);
  });

  it('bi.isBigIntish() — all four representations', () => {
    // bigint
    expect(bi.isBigIntish(0n)).toBe(true);
    expect(bi.isBigIntish(-1n)).toBe(true);
    expect(bi.isBigIntish(_over64)).toBe(true);
    // integer number
    expect(bi.isBigIntish(0)).toBe(true);
    expect(bi.isBigIntish(-42)).toBe(true);
    expect(bi.isBigIntish(Number.MAX_SAFE_INTEGER)).toBe(true);
    // decimal string
    expect(bi.isBigIntish('0')).toBe(true);
    expect(bi.isBigIntish('-42')).toBe(true);
    expect(bi.isBigIntish(_over64.toString())).toBe(true);
    // hex string
    expect(bi.isBigIntish('0x0')).toBe(true);
    expect(bi.isBigIntish('0xff')).toBe(true);
    // malformed — never silently 0n
    expect(bi.isBigIntish('')).toBe(false);
    expect(bi.isBigIntish(' ')).toBe(false);
    expect(bi.isBigIntish(' 1')).toBe(false);
    expect(bi.isBigIntish('1 ')).toBe(false);
    expect(bi.isBigIntish('1.5')).toBe(false);
    expect(bi.isBigIntish('abc')).toBe(false);
    expect(bi.isBigIntish('0x')).toBe(false);
    expect(bi.isBigIntish('0xgg')).toBe(false);
    expect(bi.isBigIntish(1.5)).toBe(false);
    expect(bi.isBigIntish(Number.NaN)).toBe(false);
    expect(bi.isBigIntish(Number.POSITIVE_INFINITY)).toBe(false);
    expect(bi.isBigIntish(null)).toBe(false);
    expect(bi.isBigIntish(undefined)).toBe(false);
    expect(bi.isBigIntish({})).toBe(false);
    expect(bi.isBigIntish([])).toBe(false);
    expect(bi.isBigIntish(true)).toBe(false);
  });

  it('bi.isBigInt()', () => {
    expect(bi.isBigInt(0n)).toBe(true);
    expect(bi.isBigInt(0)).toBe(false);
    expect(bi.isBigInt('0')).toBe(false);
  });

  it('bi.toBigInt() — conversions and round-trips', () => {
    // zero, all four forms
    expect(bi.toBigInt(0)).toBe(0n);
    expect(bi.toBigInt(0n)).toBe(0n);
    expect(bi.toBigInt('0')).toBe(0n);
    expect(bi.toBigInt('0x0')).toBe(0n);
    expect(bi.toBigInt('0x00')).toBe(0n);
    // one, all four forms (odd-length hex accepted)
    expect(bi.toBigInt(1)).toBe(1n);
    expect(bi.toBigInt(1n)).toBe(1n);
    expect(bi.toBigInt('1')).toBe(1n);
    expect(bi.toBigInt('0x1')).toBe(1n);
    expect(bi.toBigInt('0x01')).toBe(1n);
    // negatives (decimal forms only)
    expect(bi.toBigInt(-1)).toBe(-1n);
    expect(bi.toBigInt('-1')).toBe(-1n);
    expect(bi.toBigInt(-1n)).toBe(-1n);
    // larger values
    expect(bi.toBigInt('0xff')).toBe(255n);
    expect(bi.toBigInt('0x100')).toBe(256n);
    expect(bi.toBigInt('0x0100')).toBe(256n);
    expect(bi.toBigInt('0xffffffffffffffff')).toBe(CoordMax);
    // over 64 bits, round-trips between representations
    expect(bi.toBigInt(_over64.toString())).toBe(_over64);
    expect(bi.toBigInt(`0x${_over64.toString(16)}`)).toBe(_over64);
    expect(bi.toBigInt(bi.toDecimalString(_over64))).toBe(_over64);
    expect(bi.toBigInt(bi.toHex(_over64))).toBe(_over64);
  });

  it('bi.toBigInt() — rejects malformed input', () => {
    expect(() => bi.toBigInt('')).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt(' ')).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt('abc')).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt('0x')).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt('0xgg')).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt('1.5')).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt(1.5)).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt(Number.NaN)).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt(null as unknown as string)).toThrow(InvalidBigIntishError);
    expect(() => bi.toBigInt(undefined as unknown as string)).toThrow(InvalidBigIntishError);
  });

  it('bi.equals()', () => {
    // representation-immune equality
    expect(bi.equals(255, '0xff')).toBe(true);
    expect(bi.equals('255', 255n)).toBe(true);
    expect(bi.equals('0xFF', '0xff')).toBe(true);
    expect(bi.equals(0, '0x00')).toBe(true);
    expect(bi.equals(_over64, _over64.toString())).toBe(true);
    expect(bi.equals(1, 2)).toBe(false);
    expect(bi.equals(-1, 1)).toBe(false);
    // malformed input is an error on either side
    expect(() => bi.equals('', 0)).toThrow(InvalidBigIntishError);
    expect(() => bi.equals(0, '')).toThrow(InvalidBigIntishError);
  });

  it('bi.toDecimalString()', () => {
    expect(bi.toDecimalString(255)).toBe('255');
    expect(bi.toDecimalString('0xff')).toBe('255');
    expect(bi.toDecimalString(-1)).toBe('-1');
    expect(bi.toDecimalString(_over64)).toBe(_over64.toString());
  });

  it('bi.toHex() — even-length lowercase, rejects negatives', () => {
    expect(bi.toHex(0)).toBe('0x00');
    expect(bi.toHex(0n)).toBe('0x00');
    expect(bi.toHex('0')).toBe('0x00');
    expect(bi.toHex('0x0')).toBe('0x00');
    expect(bi.toHex('0x000')).toBe('0x00');
    expect(bi.toHex(1)).toBe('0x01');
    expect(bi.toHex('0x1')).toBe('0x01');
    expect(bi.toHex('0x0001')).toBe('0x01');
    expect(bi.toHex(255n)).toBe('0xff');
    expect(bi.toHex(256n)).toBe('0x0100');
    expect(bi.toHex('0xFF')).toBe('0xff');
    expect(bi.toHex(CoordMax)).toBe('0xffffffffffffffff');
    // hex form is non-negative
    expect(() => bi.toHex(-1)).toThrow(InvalidBigIntishError);
    expect(() => bi.toHex(-1n)).toThrow(InvalidBigIntishError);
  });

  it('bi.toAddress() — lowercase 20-byte padded hex', () => {
    const address = '0x8E70b94C57b0CBC9807c0F58Bc251f4cD96AcDb0'; // CrawlerToken mainnet
    const canonical = address.toLowerCase();
    // all four representations converge on the canonical form
    expect(bi.toAddress(address)).toBe(canonical);
    expect(bi.toAddress(canonical)).toBe(canonical);
    expect(bi.toAddress(bi.toBigInt(address))).toBe(canonical);
    expect(bi.toAddress(bi.toBigInt(address).toString())).toBe(canonical);
    // zero-padded to 40 digits
    expect(bi.toAddress(0)).toBe(`0x${'0'.repeat(40)}`);
    expect(bi.toAddress(1)).toBe(`0x${'0'.repeat(39)}1`);
    expect(bi.toAddress((1n << 160n) - 1n)).toBe(`0x${'f'.repeat(40)}`);
    // an address fits 20 bytes
    expect(() => bi.toAddress(1n << 160n)).toThrow(InvalidBigIntishError);
    expect(() => bi.toAddress(-1)).toThrow(InvalidBigIntishError);
  });

  it('bi.toByteArray() / bi.toNumberArray()', () => {
    expect(bi.toByteArray(0)).toEqual(new Uint8Array([0]));
    expect(bi.toByteArray(1)).toEqual(new Uint8Array([1]));
    expect(bi.toByteArray('0x0001')).toEqual(new Uint8Array([1]));
    expect(bi.toByteArray('0x010203')).toEqual(new Uint8Array([1, 2, 3]));
    expect(bi.toByteArray(255n)).toEqual(new Uint8Array([255]));
    expect(bi.toByteArray(256n)).toEqual(new Uint8Array([1, 0]));
    expect(bi.toByteArray(CoordMax)).toEqual(
      new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
    );
    expect(bi.toNumberArray('0x010201')).toEqual([1, 2, 1]);
  });

  it('bi.fromBinaryArray()', () => {
    expect(bi.fromBinaryArray([])).toBe(0n);
    expect(bi.fromBinaryArray([1])).toBe(1n);
    expect(bi.fromBinaryArray([1, 0, 1, 1, 0, 1])).toBe(0b101101n);
    expect(bi.fromBinaryArray([true, false, true])).toBe(0b101n);
    expect(bi.fromBinaryArray(new Array(256).fill(1))).toBe((1n << 256n) - 1n);
    expect(() => bi.fromBinaryArray(new Array(257).fill(0))).toThrow(RangeError);
  });
});

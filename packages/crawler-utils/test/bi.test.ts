import { describe, expect, it } from 'vitest';
import {
  type BigIntish,
  InvalidBigIntishError,
  equals,
  fromBinaryArray,
  isBigInt,
  isBigIntish,
  isHexString,
  toAddress,
  toBigInt,
  toByteArray,
  toDecimalString,
  toHex,
  toNumberArray,
} from '../src/bi';

// a value over 64 bits (a real mainnet coord)
const _over64 = 6277101735386680763835789423207666416120802188537744064512n;

describe('bi', () => {
  it('isHexString()', () => {
    expect(isHexString('0x0')).toBe(true);
    expect(isHexString('0xff')).toBe(true);
    expect(isHexString('0xDeadBeef')).toBe(true);
    expect(isHexString(`0x${_over64.toString(16)}`)).toBe(true);
    expect(isHexString('0x')).toBe(false);
    expect(isHexString('ff')).toBe(false);
    expect(isHexString('0xgg')).toBe(false);
    expect(isHexString('-0x1')).toBe(false);
    expect(isHexString(123)).toBe(false);
  });

  it('isBigInt()', () => {
    expect(isBigInt(1n)).toBe(true);
    expect(isBigInt(1)).toBe(false);
    expect(isBigInt('1')).toBe(false);
  });

  it('isBigIntish()', () => {
    expect(isBigIntish(123n)).toBe(true);
    expect(isBigIntish(123)).toBe(true);
    expect(isBigIntish('123')).toBe(true);
    expect(isBigIntish('-123')).toBe(true);
    expect(isBigIntish('0x7b')).toBe(true);
    expect(isBigIntish('')).toBe(false);
    expect(isBigIntish(' 1 ')).toBe(false);
    expect(isBigIntish(1.5)).toBe(false);
    expect(isBigIntish(Number.NaN)).toBe(false);
    expect(isBigIntish(null)).toBe(false);
  });

  it('toBigInt()', () => {
    expect(toBigInt(123)).toBe(123n);
    expect(toBigInt('123')).toBe(123n);
    expect(toBigInt('0x7b')).toBe(123n);
    expect(toBigInt(123n)).toBe(123n);
    expect(() => toBigInt('')).toThrow(InvalidBigIntishError);
    expect(() => toBigInt('nope' as BigIntish)).toThrow(InvalidBigIntishError);
    expect(() => toBigInt(1.5 as BigIntish)).toThrow(InvalidBigIntishError);
  });

  it('equals()', () => {
    expect(equals('0xff', 255)).toBe(true);
    expect(equals(255n, '255')).toBe(true);
    expect(equals(1, 2)).toBe(false);
  });

  it('toDecimalString()', () => {
    expect(toDecimalString('0xff')).toBe('255');
    expect(toDecimalString(_over64)).toBe(_over64.toString());
  });

  it('toHex()', () => {
    expect(toHex(255)).toBe('0xff');
    expect(toHex(1)).toBe('0x01'); // even digit count
    expect(toHex(0)).toBe('0x00');
    expect(() => toHex(-1)).toThrow(InvalidBigIntishError);
  });

  it('toAddress()', () => {
    expect(toAddress(1)).toBe('0x0000000000000000000000000000000000000001');
    expect(toAddress('0xABCDEF')).toBe('0x0000000000000000000000000000000000abcdef');
    expect(() => toAddress(_over64)).toThrow(InvalidBigIntishError); // > 20 bytes
    expect(() => toAddress(-1)).toThrow(InvalidBigIntishError);
  });

  it('toByteArray() / toNumberArray()', () => {
    expect(Array.from(toByteArray(0x0102))).toEqual([1, 2]);
    expect(toNumberArray('0xff00')).toEqual([255, 0]);
  });

  it('fromBinaryArray()', () => {
    expect(fromBinaryArray([1, 0, 1, 1, 0, 1])).toBe(0b101101n);
    expect(fromBinaryArray([true, false, true])).toBe(0b101n);
    expect(() => fromBinaryArray(new Array(257).fill(0))).toThrow(RangeError);
  });
});

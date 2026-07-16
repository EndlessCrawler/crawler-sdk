import { describe, expect, it } from 'vitest';
import {
  binaryArrayToBigInt,
  ec,
  flipDoorPosition,
  type Tile,
  tileToXy,
  toTilemap,
  xyToTile,
} from '../src';

const mixedmap = BigInt('0xce734001a002500188024401820241018082404180224011800a40058002aa55');
const mixedmap_int = [
  1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
  0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
  0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
  0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1,
];

describe('tilemap', () => {
  it('premises', () => {
    expect(BigInt('0b1')).toBe(1n);
    expect(BigInt('0b01')).toBe(1n);
    expect(BigInt('0b11')).toBe(3n);
    expect(BigInt('0b11111111')).toBe(255n);
    expect(mixedmap_int.length).toBe(256);
  });

  it('binaryArrayToBigInt(number[])', () => {
    const big1 = binaryArrayToBigInt(mixedmap_int);
    expect(big1.toString(16)).toBe(mixedmap.toString(16));
  });

  it('toTilemap()', () => {
    const size = { width: 2, height: 2 };
    // grid-sized arrays pass through untouched
    const stored = [0, 255, 2, 255];
    expect(toTilemap(stored, size)).toBe(stored);
    // packed bytes cannot carry leading Void bytes — padding to the grid restores them
    expect(toTilemap('0xff0002', size)).toEqual([0, 255, 0, 2]);
    expect(toTilemap(0xff0002n, size)).toEqual([0, 255, 0, 2]);
    expect(toTilemap('0x00', size)).toEqual([0, 0, 0, 0]);
    // input past the grid is ignored (warns)
    expect(toTilemap([1, 2, 3, 4, 5], size)).toEqual([1, 2, 3, 4]);
    // the ec 16×16 grid, schema-fed
    expect(toTilemap('0xff0002', ec.size)).toEqual([...new Array(253).fill(0), 255, 0, 2]);
  });

  it('flipDoorPosition()', () => {
    const _doorW = 96;
    const _doorE = 111;
    const _doorN = 9;
    const _doorS = 249;
    const _doorU = 168;
    expect(flipDoorPosition(_doorW, ec.size)).toBe(_doorE);
    expect(flipDoorPosition(_doorE, ec.size)).toBe(_doorW);
    expect(flipDoorPosition(_doorN, ec.size)).toBe(_doorS);
    expect(flipDoorPosition(_doorS, ec.size)).toBe(_doorN);
    expect(flipDoorPosition(_doorU, ec.size)).toBe(_doorU);
  });

  it('tileToXy(), xyToTile()', () => {
    const _test = (tile: Tile, x: number, y: number) => {
      expect(tileToXy(tile, ec.size)).toEqual(expect.objectContaining({ x, y }));
      expect(xyToTile({ x, y }, ec.size)).toEqual(tile);
    };
    _test(0, 0, 0);
    _test(1, 1, 0);
    _test(15, 15, 0);
    _test(16, 0, 1);
    _test(17, 1, 1);
    _test(32, 0, 2);
    _test(255, 15, 15);
  });

  it('tileToXy(), xyToTile() — schema-fed sizes', () => {
    const size = { width: 8, height: 4 };
    expect(tileToXy(9, size)).toEqual({ x: 1, y: 1 });
    expect(xyToTile({ x: 1, y: 1 }, size)).toBe(9);
    expect(flipDoorPosition(0, size)).toBe(7); // west edge → east edge
  });
});

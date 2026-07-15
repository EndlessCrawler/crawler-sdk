import { describe, expect, it } from 'vitest';
import {
  compassToCoord,
  CoordMask,
  CoordMax,
  coordToCompass,
  Dir,
  minifyNewsCompass,
  type NewsCompass,
  newsCompassEquals,
  offsetCoord,
  offsetNewsCompass,
  validateNewsCompass,
} from '../src';

const _max = 0xffffffffffffffffn; // 64-bit

describe('compass.ec (NEWS)', () => {
  it('CoordMask', () => {
    expect(CoordMask.North).toBe(_max << 192n);
    expect(CoordMask.East).toBe(_max << 128n);
    expect(CoordMask.West).toBe(_max << 64n);
    expect(CoordMask.South).toBe(_max);
  });

  it('validateNewsCompass()', () => {
    // -- positives
    expect(validateNewsCompass({ north: 11, east: 22 })).toBe(true);
    expect(validateNewsCompass({ north: 11, west: 33 })).toBe(true);
    expect(validateNewsCompass({ south: 44, east: 22 })).toBe(true);
    expect(validateNewsCompass({ south: 44, west: 33 })).toBe(true);
    // zeroes are ignored
    expect(validateNewsCompass({ north: 11, east: 22, south: 0, west: 0 })).toBe(true);
    expect(validateNewsCompass({ north: 11, east: 22, south: 0 })).toBe(true);
    expect(validateNewsCompass({ north: 11, east: 22, west: 0 })).toBe(true);
    expect(validateNewsCompass({ north: 11, west: 33, south: 0, east: 0 })).toBe(true);
    expect(validateNewsCompass({ north: 11, west: 33, south: 0 })).toBe(true);
    expect(validateNewsCompass({ north: 11, west: 33, east: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, east: 22, north: 0, west: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, east: 22, north: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, east: 22, west: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, west: 33, north: 0, east: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, west: 33, north: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, west: 33, east: 0 })).toBe(true);
    expect(validateNewsCompass({ south: 44, west: 33, east: null })).toBe(true);
    expect(validateNewsCompass({ south: 44, west: 33, east: undefined })).toBe(true);
    // check not overflowing
    expect(validateNewsCompass({ north: CoordMax, east: CoordMax })).toBe(true);
    expect(validateNewsCompass({ north: CoordMax, west: CoordMax })).toBe(true);
    expect(validateNewsCompass({ south: CoordMax, east: CoordMax })).toBe(true);
    expect(validateNewsCompass({ south: CoordMax, west: CoordMax })).toBe(true);
    // -- negatives
    // incomplete
    expect(validateNewsCompass({})).toBe(false);
    expect(validateNewsCompass({ north: 11 })).toBe(false);
    expect(validateNewsCompass({ east: 22 })).toBe(false);
    expect(validateNewsCompass({ west: 33 })).toBe(false);
    expect(validateNewsCompass({ south: 44 })).toBe(false);
    expect(validateNewsCompass({ north: 0, east: 22 })).toBe(false);
    expect(validateNewsCompass({ north: 11, east: 0 })).toBe(false);
    expect(validateNewsCompass({ north: 0, west: 33 })).toBe(false);
    expect(validateNewsCompass({ north: 11, west: 0 })).toBe(false);
    expect(validateNewsCompass({ south: 0, east: 22 })).toBe(false);
    expect(validateNewsCompass({ south: 44, east: 0 })).toBe(false);
    expect(validateNewsCompass({ south: 0, west: 33 })).toBe(false);
    expect(validateNewsCompass({ south: 44, west: 0 })).toBe(false);
    expect(validateNewsCompass({ north: 0, south: 0, east: 22 })).toBe(false);
    expect(validateNewsCompass({ north: 0, south: 0, west: 33 })).toBe(false);
    expect(validateNewsCompass({ east: 0, west: 0, north: 11 })).toBe(false);
    expect(validateNewsCompass({ east: 0, west: 0, south: 44 })).toBe(false);
    // invalids
    expect(validateNewsCompass({ north: 11, south: 44 })).toBe(false);
    expect(validateNewsCompass({ east: 22, west: 33 })).toBe(false);
    expect(validateNewsCompass({ north: 11, south: 44, east: 22 })).toBe(false);
    expect(validateNewsCompass({ north: 11, south: 44, west: 33 })).toBe(false);
    expect(validateNewsCompass({ east: 22, west: 33, north: 11 })).toBe(false);
    expect(validateNewsCompass({ east: 22, west: 33, south: 44 })).toBe(false);
  });

  it('minifyNewsCompass()', () => {
    const _keys = (compass: object | null): string[] => Object.keys(compass ?? {});
    expect(_keys(minifyNewsCompass({ north: 11, east: 22, south: 0, west: 0 }))).toEqual(
      expect.not.arrayContaining(['south', 'west']),
    );
    expect(_keys(minifyNewsCompass({ north: 11, east: 22, south: 0 }))).toEqual(
      expect.not.arrayContaining(['south', 'west']),
    );
    expect(_keys(minifyNewsCompass({ north: 11, east: 22, west: 0 }))).toEqual(
      expect.not.arrayContaining(['south', 'west']),
    );
    expect(_keys(minifyNewsCompass({ north: 11, west: 33, south: 0, east: 0 }))).toEqual(
      expect.not.arrayContaining(['south', 'east']),
    );
    expect(_keys(minifyNewsCompass({ north: 11, west: 33, south: 0 }))).toEqual(
      expect.not.arrayContaining(['south', 'east']),
    );
    expect(_keys(minifyNewsCompass({ north: 11, west: 33, east: 0 }))).toEqual(
      expect.not.arrayContaining(['south', 'east']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, east: 22, north: 0, west: 0 }))).toEqual(
      expect.not.arrayContaining(['north', 'west']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, east: 22, north: 0 }))).toEqual(
      expect.not.arrayContaining(['north', 'west']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, east: 22, west: 0 }))).toEqual(
      expect.not.arrayContaining(['north', 'west']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, west: 33, north: 0, east: 0 }))).toEqual(
      expect.not.arrayContaining(['north', 'east']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, west: 33, north: 0 }))).toEqual(
      expect.not.arrayContaining(['north', 'east']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, west: 33, east: 0 }))).toEqual(
      expect.not.arrayContaining(['north', 'east']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, west: 33, north: null, east: null }))).toEqual(
      expect.not.arrayContaining(['north', 'east']),
    );
    expect(
      _keys(minifyNewsCompass({ south: 44, west: 33, north: undefined, east: undefined })),
    ).toEqual(expect.not.arrayContaining(['north', 'east']));
    expect(_keys(minifyNewsCompass({ south: 44, west: 33, east: null }))).toEqual(
      expect.not.arrayContaining(['north', 'east']),
    );
    expect(_keys(minifyNewsCompass({ south: 44, west: 33, east: undefined }))).toEqual(
      expect.not.arrayContaining(['north', 'east']),
    );
    // yonder too
    expect(_keys(minifyNewsCompass({ north: 11, east: 22, yonder: 0 }))).toEqual(
      expect.not.arrayContaining(['yonder']),
    );
    expect(_keys(minifyNewsCompass({ north: 11, east: 22, yonder: 33 }))).toEqual(
      expect.arrayContaining(['yonder']),
    );
  });

  it('newsCompassEquals()', () => {
    // positives
    expect(newsCompassEquals({ north: 11, east: 22 }, { north: 11, east: 22 })).toBe(true);
    expect(newsCompassEquals({ north: 11, east: 22 }, { east: 22, north: 11 })).toBe(true);
    expect(
      newsCompassEquals({ north: 11, east: 22 }, { north: 11, east: 22, south: 0, west: 0 }),
    ).toBe(true);
    expect(
      newsCompassEquals({ north: 11, east: 22 }, { south: 0, west: 0, north: 11, east: 22 }),
    ).toBe(true);
    // negatives
    expect(newsCompassEquals({ north: 11, east: 22 }, { north: 11, west: 22 })).toBe(false);
    expect(newsCompassEquals({ north: 11, east: 22 }, { north: 11, east: 99 })).toBe(false);
    // invalids
    expect(newsCompassEquals({ north: 11, south: 44 }, { south: 44, north: 11 })).toBe(false);
  });

  it('offsetCoord(), offsetNewsCompass(), compassToCoord(), coordToCompass()', () => {
    const _validateCompass = (
      compass: NewsCompass,
      north: bigint,
      east: bigint,
      west: bigint,
      south: bigint,
    ) => {
      expect(compass.north).toBe(north);
      expect(compass.east).toBe(east);
      expect(compass.west).toBe(west);
      expect(compass.south).toBe(south);
    };
    const _validateCoord = (
      coord: bigint,
      north: bigint,
      east: bigint,
      west: bigint,
      south: bigint,
    ) => {
      _validateCompass(coordToCompass(coord) as NewsCompass, north, east, west, south);
    };
    const _makeCoord = (north: bigint, east: bigint, west: bigint, south: bigint) => {
      return compassToCoord({ north, east, west, south });
    };
    const _testOffset = (
      coord: bigint,
      dir: Dir,
      north: bigint,
      east: bigint,
      west: bigint,
      south: bigint,
    ): bigint => {
      // validate offsetCoord()
      const offCoord = offsetCoord(coord, dir);
      _validateCoord(offCoord, north, east, west, south);
      // validate offsetNewsCompass()
      const compass = coordToCompass(coord) as NewsCompass;
      const offCompass = offsetNewsCompass(compass, dir) as NewsCompass;
      _validateCompass(offCompass, north, east, west, south);
      return offCoord;
    };

    // Offset North
    let _coord: bigint;
    {
      _coord = _makeCoord(0n, 1n, 0n, 2n);
      _validateCoord(_coord, 0n, 1n, 0n, 2n);
      _coord = _testOffset(_coord, Dir.North, 0n, 1n, 0n, 1n);
      _coord = _testOffset(_coord, Dir.North, 1n, 1n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.North, 2n, 1n, 0n, 0n);
      // limit: no overflow, returns same
      _coord = _makeCoord(CoordMax, 1n, 0n, 0n);
      _validateCoord(_coord, CoordMax, 1n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.North, CoordMax, 1n, 0n, 0n);
    }
    // Offset South
    {
      _coord = _makeCoord(2n, 1n, 0n, 0n);
      _validateCoord(_coord, 2n, 1n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.South, 1n, 1n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.South, 0n, 1n, 0n, 1n);
      _coord = _testOffset(_coord, Dir.South, 0n, 1n, 0n, 2n);
      // limit: no overflow, returns same
      _coord = _makeCoord(0n, 1n, 0n, CoordMax);
      _validateCoord(_coord, 0n, 1n, 0n, CoordMax);
      _coord = _testOffset(_coord, Dir.South, 0n, 1n, 0n, CoordMax);
    }
    // Offset East
    {
      _coord = _makeCoord(1n, 0n, 2n, 0n);
      _validateCoord(_coord, 1n, 0n, 2n, 0n);
      _coord = _testOffset(_coord, Dir.East, 1n, 0n, 1n, 0n);
      _coord = _testOffset(_coord, Dir.East, 1n, 1n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.East, 1n, 2n, 0n, 0n);
      // limit: no overflow, returns same
      _coord = _makeCoord(1n, CoordMax, 0n, 0n);
      _validateCoord(_coord, 1n, CoordMax, 0n, 0n);
      _coord = _testOffset(_coord, Dir.East, 1n, CoordMax, 0n, 0n);
    }
    // Offset West
    {
      _coord = _makeCoord(1n, 2n, 0n, 0n);
      _validateCoord(_coord, 1n, 2n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.West, 1n, 1n, 0n, 0n);
      _coord = _testOffset(_coord, Dir.West, 1n, 0n, 1n, 0n);
      _coord = _testOffset(_coord, Dir.West, 1n, 0n, 2n, 0n);
      // limit: no overflow, returns same
      _coord = _makeCoord(1n, 0n, CoordMax, 0n);
      _validateCoord(_coord, 1n, 0n, CoordMax, 0n);
      _coord = _testOffset(_coord, Dir.West, 1n, 0n, CoordMax, 0n);
    }
    // offset should keep yonder
    const yonderCompass = offsetNewsCompass(
      { south: 1n, east: 2n, yonder: 3n },
      Dir.East,
    ) as NewsCompass;
    expect(yonderCompass.yonder).toBe(3n);
  });
});

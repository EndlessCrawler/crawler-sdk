import { describe, expect, it } from 'vitest';
import { cnc, Dir, ec, getInvalidatedCoords, neighborCoords, offsetCoord } from '../src';
import { COORD } from './fixtures';

describe('neighborCoords() — the NEWS adjacency', () => {
  it('returns the four cardinal neighbours in NEWS order', () => {
    expect(neighborCoords(COORD)).toEqual([
      offsetCoord(COORD, Dir.North),
      offsetCoord(COORD, Dir.East),
      offsetCoord(COORD, Dir.West),
      offsetCoord(COORD, Dir.South),
    ]);
  });

  it('excludes boundary-saturated offsets', () => {
    // the far south-west corner cannot go further south or west
    const corner = (0xffffffffffffffffn << 64n) + 0xffffffffffffffffn; // W max, S max
    const neighbors = neighborCoords(corner);
    expect(neighbors).toEqual([offsetCoord(corner, Dir.North), offsetCoord(corner, Dir.East)]);
    expect(neighbors).not.toContain(corner);
  });
});

describe('getInvalidatedCoords() — the schema invalidation policy', () => {
  it("'neighbours' (ec): a mint invalidates its NEWS neighbours", () => {
    expect(ec.invalidation).toBe('neighbours');
    expect(getInvalidatedCoords(ec, COORD)).toEqual(neighborCoords(COORD));
    // BigIntish coord input
    expect(getInvalidatedCoords(ec, COORD.toString())).toEqual(neighborCoords(COORD));
  });

  it("'none' (cnc): a mint changes nothing else", () => {
    expect(cnc.invalidation).toBe('none');
    expect(getInvalidatedCoords(cnc, 1n)).toEqual([]);
  });
});

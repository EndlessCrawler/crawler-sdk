import { describe, expect, it } from 'vitest';
import {
  compassToCoord,
  compassToSlug,
  CoordMax,
  coordToSlug,
  type NewsCompassInput,
  newsCompassEquals,
  type SlugSeparator,
  slugSeparators,
  slugToCompass,
  slugToCoord,
  validateNewsCompass,
  validateSlug,
} from '../src';

/** bigint-safe stringify for failure messages (no BigInt.prototype monkeypatch) */
const _json = (value: unknown): string =>
  JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v));

type TestPair = {
  slug: string;
  compass: NewsCompassInput | null;
  forwardOnly?: boolean;
};

const _slugs: TestPair[] = [
  // invalids
  { slug: '', compass: null },
  { slug: 'N0,E0', compass: null },
  { slug: 'N0,W0', compass: null },
  { slug: 'S0,E0', compass: null },
  { slug: 'S0,W0', compass: null },
  { slug: 'N0,E1', compass: null },
  { slug: 'N0,W1', compass: null },
  { slug: 'S0,E1', compass: null },
  { slug: 'S0,W1', compass: null },
  { slug: 'N1,E0', compass: null },
  { slug: 'N1,W0', compass: null },
  { slug: 'S1,E0', compass: null },
  { slug: 'S1,W0', compass: null },
  { slug: 'N1,S1,E1,W1', compass: null },
  { slug: 'N1,S1,E1', compass: null },
  { slug: 'N1,S1,W1', compass: null },
  { slug: 'N1,E1,W1', compass: null },
  { slug: 'S1,E1,W1', compass: null },
  { slug: 'N1,E1 ', compass: null },
  { slug: ' N1,E1', compass: null },
  { slug: ' N1,E1 ', compass: null },
  { slug: 'NN1,E1', compass: null },
  { slug: 'N1,EE1', compass: null },
  { slug: 'ASDN1,E1', compass: null },
  { slug: 'N1,E1E', compass: null },
  { slug: 'N1', compass: null },
  { slug: 'E1', compass: null },
  { slug: 'W1', compass: null },
  { slug: 'S1', compass: null },
  // valids
  { slug: 'N1,E1', compass: { north: 1n, east: 1n } },
  { slug: 'N1,W1', compass: { north: 1n, west: 1n } },
  { slug: 'S1,E1', compass: { south: 1n, east: 1n } },
  { slug: 'S1,W1', compass: { south: 1n, west: 1n } },
  { slug: 'N2,E3', compass: { north: 2n, east: 3n } },
  { slug: 'N4,W5', compass: { north: 4n, west: 5n } },
  { slug: 'S6,E7', compass: { south: 6n, east: 7n } },
  { slug: 'S8,W9', compass: { south: 8n, west: 9n } },
  { slug: 'N111,E218', compass: { north: 111n, east: 218n } },
  { slug: 'N9999,W1', compass: { north: 9999n, west: 1n } },
  { slug: 'S1,E238422', compass: { south: 1n, east: 238422n } },
  { slug: 'S73236032230,W7723692223', compass: { south: 73236032230n, west: 7723692223n } },
  // max
  {
    slug: `N${CoordMax.toString()},E${CoordMax.toString()}`,
    compass: { north: CoordMax, east: CoordMax },
  },
  {
    slug: `N${CoordMax.toString()},W${CoordMax.toString()}`,
    compass: { north: CoordMax, west: CoordMax },
  },
  {
    slug: `S${CoordMax.toString()},E${CoordMax.toString()}`,
    compass: { south: CoordMax, east: CoordMax },
  },
  {
    slug: `S${CoordMax.toString()},W${CoordMax.toString()}`,
    compass: { south: CoordMax, west: CoordMax },
  },
  // zero padding is ok
  { slug: 'N01,E01', compass: { north: 1n, east: 1n }, forwardOnly: true },
  { slug: 'N01,W01', compass: { north: 1n, west: 1n }, forwardOnly: true },
  { slug: 'S01,E01', compass: { south: 1n, east: 1n }, forwardOnly: true },
  { slug: 'S01,W01', compass: { south: 1n, west: 1n }, forwardOnly: true },
  // yonder
  { slug: 'N1,E1,Y1', compass: { north: 1n, east: 1n, yonder: 1n } },
  { slug: 'S8,W9,Y7', compass: { south: 8n, west: 9n, yonder: 7n } },
];

describe('slug.ec (NEWS)', () => {
  const _validateSlug = (pair: TestPair, separator: SlugSeparator) => {
    const slug = pair.slug.split(',').join(separator ?? '');
    expect(validateSlug(slug), `Slug [${slug}] is not valid`).toBe(true);
    // convert to Compass
    const asCompass = slugToCompass(slug);
    expect(asCompass, `Slug [${slug}] compass [${_json(asCompass)}] should not be null`).not.toBe(
      null,
    );
    expect(
      newsCompassEquals(asCompass, pair.compass),
      `Slug [${slug}] compass [${_json(asCompass)}] is not [${_json(pair.compass)}]`,
    ).toBe(true);
    // convert to coord
    const asCoord = slugToCoord(slug);
    const expectedCoord = compassToCoord(pair.compass);
    expect(asCoord, `Slug [${slug}] coord [${asCoord}] should not be zero`).not.toBe(0n);
    expect(asCoord, `Slug [${slug}] coord [${asCoord}] is not [${expectedCoord}]`).toBe(
      expectedCoord,
    );
    // backward conversion
    if (!pair.forwardOnly) {
      const slugFromCompass = compassToSlug(pair.compass, separator);
      expect(slugFromCompass, `Compass [${_json(pair.compass)}] slug is not [${slug}]`).toBe(
        slug.toUpperCase(),
      );
      if (!pair.compass?.yonder) {
        // compass > coord > slug (no yonder in coord)
        const slugFromCoord = coordToSlug(compassToCoord(pair.compass), separator);
        expect(slugFromCoord, `coord [${slugFromCoord}] slug is not [${slug}]`).toBe(
          slug.toUpperCase(),
        );
      }
    }
  };

  const _invalidateSlug = (slug: string) => {
    expect(validateSlug(slug), `Slug [${slug}] is not invalid`).toBe(false);
    // convert to Compass
    const asCompass = slugToCompass(slug);
    expect(asCompass, `Slug [${slug}] compass [${_json(asCompass)}] is not null`).toBe(null);
    // convert to coord
    const asCoord = slugToCoord(slug);
    expect(asCoord, `Slug [${slug}] coord [${asCoord}] is not 0n`).toBe(0n);
  };

  it('validate/invalidate slugs', () => {
    _slugs.forEach((pair) => {
      const slug = pair.slug;
      const compass = pair.compass;
      if (compass == null) {
        // Invalid slugs
        expect(validateNewsCompass(compass)).toBe(false);
        _invalidateSlug(slug);
      } else {
        // Valid slugs
        expect(validateNewsCompass(compass)).toBe(true);
        // validate using all separators
        slugSeparators.forEach((s) => {
          _validateSlug(pair, s);
          _validateSlug({ ...pair, slug: slug.toLowerCase(), forwardOnly: true }, s);
        });
        // invalidate bad separators
        _invalidateSlug(slug.replace(',', 'x'));
        _invalidateSlug(slug.replace(',', '?'));
        _invalidateSlug(slug.replace(',', ',,'));
        _invalidateSlug(slug.replace(',', '  '));
        _invalidateSlug(slug.replace(',', ',N1'));
      }
    });
  });
});

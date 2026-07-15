/**
 * `NEWS` — the first coordinate schema: North / East / West / South.
 *
 * Designed for EndlessCrawler's perfect grid: every chamber has 4 doors, one per
 * edge, and chambers keep being minted indefinitely, so navigation is
 * 4 doors → 4 directions → 4 destination coords.
 *
 * A chamber's coordinate is designated by North, East, West, South values (uint64),
 * packed into a uint256:
 *
 * ```
 * North            East             West             South
 * ffffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffff
 * ```
 *
 * Directions are ALWAYS in NEWS order (North, East, West, South) — just because
 * it is catchy and easy to remember.
 *
 * The bit-level semantics mirror the on-chain packing (`Crawl.sol`) and are frozen:
 * the compass/coord/slug test suites assert exact packed bigint values.
 */
import { Dir } from '../chamber/constants';
import type { CoordinateSchemaLibrary } from './types';

//-----------------------------------
// Compass types
//

/** A compass direction as accepted on input — absent forms are all "no value". */
export type NewsCompassDir = bigint | number | null | undefined;

/**
 * The canonical NEWS compass: a valid compass has exactly one of north/south and
 * exactly one of east/west positive (the four-quadrant validity invariant, checked
 * by {@link validateNewsCompass}). `yonder` is optional and rides along conversions.
 */
export type NewsCompass = {
  north?: bigint;
  east?: bigint;
  west?: bigint;
  south?: bigint;
  yonder?: bigint;
};

/**
 * A NEWS compass as accepted on input: direction values may be `bigint` or `number`
 * (absent as `0`/`null`/`undefined`). Conversions emit the canonical {@link NewsCompass}.
 */
export type NewsCompassInput = {
  north?: NewsCompassDir;
  east?: NewsCompassDir;
  west?: NewsCompassDir;
  south?: NewsCompassDir;
  yonder?: NewsCompassDir;
};

//-----------------------------------
// Packing constants
//

/** The maximum value in any compass direction (64-bit): `18_446_744_073_709_551_615n`. */
export const CoordMax = 0xffffffffffffffffn;

/** Bit offset of each direction inside the packed uint256 (NEWS order). */
export const CoordOffset = {
  North: 192n,
  East: 128n,
  West: 64n,
  South: 0n,
} as const;

/** Bit mask of each direction inside the packed uint256 (+ inverted masks). */
export const CoordMask = {
  North: CoordMax << CoordOffset.North,
  East: CoordMax << CoordOffset.East,
  West: CoordMax << CoordOffset.West,
  South: CoordMax, // << CoordOffset.South
  // inverted masks
  InvNorth: ~(CoordMax << CoordOffset.North),
  InvEast: ~(CoordMax << CoordOffset.East),
  InvWest: ~(CoordMax << CoordOffset.West),
  InvSouth: ~CoordMax, // << CoordOffset.South
} as const;

/** The number 1 in each compass direction. */
export const CoordOne = {
  North: 1n << CoordOffset.North,
  East: 1n << CoordOffset.East,
  West: 1n << CoordOffset.West,
  South: 1n, // << CoordOffset.South
} as const;

//-----------------------------------
// Slug separators
//

/**
 * The separators accepted between a slug's compass parts. Any listed separator is
 * valid on parse; {@link defaultSlugSeparator} is emitted.
 */
export const slugSeparators = [null, '', ',', '.', ';', '-'] as const;

/** A valid slug separator. */
export type SlugSeparator = (typeof slugSeparators)[number];

/** The canonical separator emitted by slug conversions. */
export const defaultSlugSeparator: SlugSeparator = ',';

//-----------------------------------
// Compass functions
//

/**
 * @param compass the compass to validate
 * @returns true if exactly one of north/south and exactly one of east/west is positive
 */
export const validateNewsCompass = (compass: NewsCompassInput | null): boolean => {
  if (!compass) return false;
  const hasNorth = compass.north && compass.north > 0n;
  const hasSouth = compass.south && compass.south > 0n;
  const hasEast = compass.east && compass.east > 0n;
  const hasWest = compass.west && compass.west > 0n;
  if (
    (hasNorth && hasSouth) ||
    (!hasNorth && !hasSouth) ||
    (hasEast && hasWest) ||
    (!hasEast && !hasWest)
  )
    return false;
  return true;
};

/**
 * @param compass the compass to validate
 * @returns the compass if it is valid, else `null`
 */
export const validatedNewsCompass = <T extends NewsCompassInput>(compass: T | null): T | null =>
  validateNewsCompass(compass) ? compass : null;

/**
 * @param compass the compass to minify
 * @returns the compass without its empty fields, or `null` if it is invalid
 */
export const minifyNewsCompass = <T extends NewsCompassInput>(compass: T | null): T | null => {
  if (!compass || !validateNewsCompass(compass)) {
    return null;
  }
  return Object.keys(compass).reduce((acc, key) => {
    const _key = key as keyof NewsCompassInput;
    if (compass[_key]) (acc as NewsCompassInput)[_key] = compass[_key];
    return acc;
  }, {} as T);
};

/**
 * @param a a compass
 * @param b another compass
 * @returns true if both are valid and their minified forms are strictly equal, field by field
 */
export const newsCompassEquals = (
  a: NewsCompassInput | null,
  b: NewsCompassInput | null,
): boolean => {
  const aa = minifyNewsCompass(a);
  const bb = minifyNewsCompass(b);
  if (!aa || !bb) return false;
  return Object.keys(aa).reduce((acc, key) => {
    if (!acc) return false;
    const _key = key as keyof NewsCompassInput;
    return aa[_key] === bb[_key];
  }, true);
};

/**
 * @param compass the compass to offset
 * @param dir the direction to move one chamber in
 * @returns the offset compass, or `null` if the compass is invalid
 */
export const offsetNewsCompass = (
  compass: NewsCompassInput | null,
  dir: Dir,
): NewsCompassInput | null => {
  if (!compass) return null;
  const _add = (v: NewsCompassDir) => (!v ? 1n : v < CoordMax ? BigInt(v) + 1n : v);
  const _sub = (v: NewsCompassDir) => (!v ? 0n : BigInt(v) - 1n);
  const result = { ...compass };
  if (dir === Dir.North) {
    result.south = _sub(result.south);
    if (!result.south) result.north = _add(result.north);
  } else if (dir === Dir.South) {
    result.north = _sub(result.north);
    if (!result.north) result.south = _add(result.south);
  } else if (dir === Dir.East) {
    result.west = _sub(result.west);
    if (!result.west) result.east = _add(result.east);
  } else if (dir === Dir.West) {
    result.east = _sub(result.east);
    if (!result.east) result.west = _add(result.west);
  }
  return validatedNewsCompass(result);
};

//-----------------------------------
// Coord functions
//

/**
 * Offsets a packed coord by one chamber in a direction, working directly on the
 * packed bits. At the 64-bit boundary the coord saturates (returns unchanged).
 *
 * @param coord the packed coordinate
 * @param dir the direction to move one chamber in
 * @returns the offset coord (or the same coord at the boundary)
 */
export const offsetCoord = (coord: bigint, dir: Dir): bigint => {
  if (dir === Dir.North) {
    if ((coord & CoordMask.South) > CoordOne.South) return coord - CoordOne.South; // --South
    if ((coord & CoordMask.North) !== CoordMask.North)
      return (coord & CoordMask.InvSouth) + CoordOne.North; // ++North
  } else if (dir === Dir.East) {
    if ((coord & CoordMask.West) > CoordOne.West) return coord - CoordOne.West; // --West
    if ((coord & CoordMask.East) !== CoordMask.East)
      return (coord & CoordMask.InvWest) + CoordOne.East; // ++East
  } else if (dir === Dir.West) {
    if ((coord & CoordMask.East) > CoordOne.East) return coord - CoordOne.East; // --East
    if ((coord & CoordMask.West) !== CoordMask.West)
      return (coord & CoordMask.InvEast) + CoordOne.West; // ++West
  } else if (dir === Dir.South) {
    if ((coord & CoordMask.North) > CoordOne.North) return coord - CoordOne.North; // --North
    if ((coord & CoordMask.South) !== CoordMask.South)
      return (coord & CoordMask.InvNorth) + CoordOne.South; // ++South
  }
  return coord;
};

/**
 * @param coord the packed coordinate
 * @returns the coord unpacked to a {@link NewsCompass}, or `null` if invalid
 */
export const coordToCompass = (coord: bigint): NewsCompass | null => {
  if (coord === 0n) return null;
  const result: NewsCompass = {
    north: (coord >> CoordOffset.North) & CoordMax,
    east: (coord >> CoordOffset.East) & CoordMax,
    west: (coord >> CoordOffset.West) & CoordMax,
    south: coord & CoordMax,
  };
  return validatedNewsCompass(result);
};

/**
 * @param compass the compass to pack
 * @returns the compass packed to a coord, or `0n` if the compass is invalid
 */
export const compassToCoord = (compass: NewsCompassInput | null): bigint => {
  let result = 0n;
  if (compass && validateNewsCompass(compass)) {
    if (compass.north && compass.north > 0n) result += BigInt(compass.north) << CoordOffset.North;
    if (compass.east && compass.east > 0n) result += BigInt(compass.east) << CoordOffset.East;
    if (compass.west && compass.west > 0n) result += BigInt(compass.west) << CoordOffset.West;
    if (compass.south && compass.south > 0n) result += BigInt(compass.south);
  }
  return result;
};

/**
 * @param coord the packed coordinate to validate
 * @returns true if the coord unpacks to a valid compass
 */
export const validateCoord = (coord: bigint): boolean => {
  return coordToCompass(coord) != null;
};

//-----------------------------------
// Slug functions
//

/**
 * @param compass the compass to render
 * @param separator the separator to emit (defaults to the canonical `','`)
 * @returns the readable slug (`'N1,E2'`), or an empty string if the compass is invalid
 */
export const compassToSlug = (
  compass: NewsCompassInput | null,
  separator: SlugSeparator = defaultSlugSeparator,
): string | null => {
  let result = '';
  if (compass && validateNewsCompass(compass)) {
    if (compass.north && compass.north > 0n) result += `N${compass.north}`;
    if (compass.south && compass.south > 0n) result += `S${compass.south}`;
    if (separator) result += separator;
    if (compass.east && compass.east > 0n) result += `E${compass.east}`;
    if (compass.west && compass.west > 0n) result += `W${compass.west}`;
    if (compass.yonder && compass.yonder > 0) {
      if (separator) result += separator;
      result += `Y${compass.yonder}`;
    }
  }
  return result;
};

/**
 * Parses a slug into a compass. Any separator in {@link slugSeparators} is accepted.
 *
 * @param slug the readable slug (`'N1,E2'`, `'n1e2'`, ...)
 * @returns the parsed {@link NewsCompass}, or `null` if the slug is invalid
 */
export const slugToCompass = (slug: string | null): NewsCompass | null => {
  if (!slug) return null;
  const _regex = /^[NnSs]\d+.{0,1}[EeWw]\d+(?:.{0,1}[Yy]\d+)?$/g; // NEWS[Y]
  if (!_regex.exec(slug)) return null;
  // match each direction
  const north = /[Nn]\d+/g.exec(slug);
  const east = /[Ee]\d+/g.exec(slug);
  const west = /[Ww]\d+/g.exec(slug);
  const south = /[Ss]\d+/g.exec(slug);
  const yonder = /[Yy]\d+/g.exec(slug);
  // validate separator (will be a number if no separator)
  const _slugSeparatorTester: string = slugSeparators.join('') + '0123456789';
  const separatorIndex: number = (east?.index ?? west?.index ?? 0) - 1;
  if (separatorIndex < 0 || !_slugSeparatorTester.includes(slug.charAt(separatorIndex)))
    return null;
  // build compass
  const result: NewsCompass = {};
  if (north) result.north = BigInt(north[0].slice(1));
  if (east) result.east = BigInt(east[0].slice(1));
  if (west) result.west = BigInt(west[0].slice(1));
  if (south) result.south = BigInt(south[0].slice(1));
  if (yonder) result.yonder = BigInt(yonder[0].slice(1));
  return validatedNewsCompass(result);
};

/**
 * @param coord the packed coordinate
 * @param separator the separator to emit (defaults to the canonical `','`)
 * @returns the coord's readable slug, or `null`/empty if the coord is invalid
 */
export const coordToSlug = (
  coord: bigint,
  separator: SlugSeparator = defaultSlugSeparator,
): string | null => {
  return compassToSlug(coordToCompass(coord), separator);
};

/**
 * @param slug the readable slug
 * @returns the slug's packed coordinate, or `0n` if the slug is invalid
 */
export const slugToCoord = (slug: string | null): bigint => {
  return compassToCoord(slugToCompass(slug));
};

/**
 * @param slug the slug to validate
 * @returns true if the slug parses to a valid compass
 */
export const validateSlug = (slug: string | null): boolean => {
  return slugToCompass(slug) != null;
};

//-----------------------------------
// The library object
//

/** The full NEWS library type — what `world.coords` exposes for NEWS worlds. */
export interface NewsLibrary extends CoordinateSchemaLibrary {
  readonly name: 'news';
  readonly Dir: typeof Dir;
  readonly CoordMax: typeof CoordMax;
  readonly CoordOffset: typeof CoordOffset;
  readonly CoordMask: typeof CoordMask;
  readonly CoordOne: typeof CoordOne;
  readonly slugSeparators: typeof slugSeparators;
  readonly defaultSlugSeparator: SlugSeparator;
  validateCompass(compass: NewsCompassInput | null): boolean;
  validatedCompass<T extends NewsCompassInput>(compass: T | null): T | null;
  minifyCompass<T extends NewsCompassInput>(compass: T | null): T | null;
  compassEquals(a: NewsCompassInput | null, b: NewsCompassInput | null): boolean;
  offsetCompass(compass: NewsCompassInput | null, dir: Dir): NewsCompassInput | null;
  offsetCoord(coord: bigint, dir: Dir): bigint;
  coordToCompass(coord: bigint): NewsCompass | null;
  compassToCoord(compass: NewsCompassInput | null): bigint;
  compassToSlug(compass: NewsCompassInput | null, separator?: SlugSeparator): string | null;
  slugToCompass(slug: string | null): NewsCompass | null;
  coordToSlug(coord: bigint, separator?: SlugSeparator): string | null;
  slugToCoord(slug: string | null): bigint;
  validateSlug(slug: string | null): boolean;
}

/**
 * The NEWS coordinate-schema library — resolved from the registry by name (`'news'`)
 * and reached through the world (`world.coords`). Used chiefly by converters at
 * build time to compute door destinations; games navigate by door `destCoord`.
 */
export const news: NewsLibrary = {
  name: 'news',
  Dir,
  CoordMax,
  CoordOffset,
  CoordMask,
  CoordOne,
  slugSeparators,
  defaultSlugSeparator,
  validateCompass: validateNewsCompass,
  validatedCompass: validatedNewsCompass,
  minifyCompass: minifyNewsCompass,
  compassEquals: newsCompassEquals,
  offsetCompass: offsetNewsCompass,
  offsetCoord,
  coordToCompass,
  compassToCoord,
  compassToSlug,
  slugToCompass,
  coordToSlug,
  slugToCoord,
  validateCoord,
  validateSlug,
};

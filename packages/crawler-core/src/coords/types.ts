/**
 * Coordinate-schema base types — the seam between a world's data and the library
 * of functions that navigates it (see `SDK_SPECS.md` §Schemas).
 */

/**
 * The registered coordinate-schema names — a literal union, never bare `string`.
 * Coordinate schemas are reusable: a new world with its own chamber schema can
 * adopt an existing coordinate schema.
 */
export type CoordinateSchemaName = 'news' | 'chamber-id';

/**
 * A compass — a named-directions object, the readable form of a coord.
 *
 * Each coordinate schema defines its own concrete compass shape (NEWS uses the
 * four-quadrant form); a coordinate schema may define none at all, in which case
 * compass lookups yield `undefined`. Stored in `ChamberData` where defined, so
 * data-only consumers get readable positions.
 */
export type Compass = {
  readonly [direction: string]: bigint | undefined;
};

/**
 * The minimal surface every coordinate-schema library provides. Concrete libraries
 * (e.g. NEWS) extend this with their full navigation/conversion function set —
 * reached through the world (`world.coords`), not the standard client surface.
 */
export interface CoordinateSchemaLibrary {
  /** the registered name this library resolves from */
  readonly name: CoordinateSchemaName;
  /**
   * @param coord the packed coordinate to validate
   * @returns true if the coord is well-formed for this coordinate schema
   */
  validateCoord(coord: bigint): boolean;
  /**
   * @param coord the packed coordinate
   * @returns the coord's readable slug, or `null` if the coord is invalid
   */
  coordToSlug(coord: bigint): string | null;
  /**
   * @param slug the readable slug
   * @returns the packed coordinate, or `0n` if the slug is invalid
   */
  slugToCoord(slug: string | null): bigint;
  /**
   * @param coord the packed coordinate
   * @returns the coord's {@link Compass}, or `null` if this coordinate schema
   *   defines no compass (or the coord is invalid)
   */
  coordToCompass(coord: bigint): Compass | null;
  /**
   * @param compass the compass to pack — absent for coordinate schemas that
   *   define no compass (compass locators then resolve to `undefined`)
   * @returns the packed coordinate, or `0n` if the compass is invalid
   */
  compassToCoord?(compass: Compass): bigint;
  /**
   * The coordinate schema's neighbour offsets — the coords adjacent to `coord`
   * (NEWS: the four cardinal offsets). Absent for coordinate schemas with no
   * adjacency (`'neighbours'` invalidation then resolves to no coords).
   *
   * @param coord the packed coordinate
   * @returns the neighbouring coords (boundary-saturated offsets excluded)
   */
  neighborCoords?(coord: bigint): bigint[];
}

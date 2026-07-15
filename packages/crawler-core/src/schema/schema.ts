/**
 * Schemas — the axis of variation between level-data formats (see `SDK_SPECS.md` §Schemas).
 *
 * A schema exists at runtime as a plain descriptor object; the type level derives
 * from the descriptor (`as const satisfies DataSchema`) — one source of truth for
 * the load-time validator and the derived types.
 */
import type { CoordinateSchemaName } from '../coords/types';
import type { TilemapSize } from '../chamber/tilemap';

/** A chamber's size in tiles — alias of the tilemap size (the chamber layout's grid). */
export type ChamberSize = TilemapSize;

/**
 * The views a schema can declare (optional per world). `worldInfo` is universal —
 * every world carries one regardless of schema — so it is not declared here.
 */
export type SchemaViewName = 'tokenCoord' | 'chamberData' | 'tokenSvg';

/**
 * The value domain of one schema-local attribute:
 * a primitive kind (`'number' | 'string' | 'boolean'`), `'tile'` (a tile position),
 * or an explicit readable-string domain (e.g. the `ec` gem names).
 */
export type AttributeSpec = 'number' | 'string' | 'boolean' | 'tile' | readonly string[];

/**
 * A data schema — the specification a world conforms to. Carries only what is shared
 * by every world conforming to it (`name`, `network`, `chainId`, contract binding are
 * World fields, not schema fields).
 *
 * Two halves: the chamber-payload spec (`size`, `terrains`, `attributes`, `views`)
 * and the coordinate system (`coordinateSchema`, resolved from the name → library
 * registry at world load).
 */
export interface DataSchema {
  /** the schema's registered name (`'ec'`, `'cnc'`) */
  readonly name: string;
  /** size policy: a fixed grid (chambers do NOT carry a size) or `'per-chamber'` (every chamber carries one) */
  readonly size: ChamberSize | 'per-chamber';
  /** the terrain value domain — readable strings, stored as-is */
  readonly terrains: readonly string[];
  /** the coordinate schema this world navigates by (name → library registry) */
  readonly coordinateSchema: CoordinateSchemaName;
  /** the views that CAN exist in a conforming world (each world carries the views it has) */
  readonly views: readonly SchemaViewName[];
  /** the schema-local gameplay extras and their value domains */
  readonly attributes: { readonly [attribute: string]: AttributeSpec };
}

/** The terrain string union derived from a schema descriptor. */
export type TerrainOf<S extends DataSchema> = S['terrains'][number];

/** The value type of one {@link AttributeSpec}. */
export type AttributeValueOf<A extends AttributeSpec> = A extends 'number' | 'tile'
  ? number
  : A extends 'string'
    ? string
    : A extends 'boolean'
      ? boolean
      : A extends readonly string[]
        ? A[number]
        : never;

/** The typed attributes object derived from a schema descriptor. */
export type AttributesOf<S extends DataSchema> = {
  readonly [K in keyof S['attributes']]: AttributeValueOf<S['attributes'][K]>;
};

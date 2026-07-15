/**
 * The `cnc` schema — Crypts & Caverns, the first non-`ec` schema (cache + converter
 * ship in v1; see `SDK_SPECS.md` §Schemas).
 */
import type { AttributesOf, DataSchema, TerrainOf } from './schema';

/**
 * The `cnc` schema descriptor (see `SDK_SPECS.md` §Schemas).
 *
 * Per-chamber size (every chamber carries `{ width, height }`).
 *
 * @remarks `cnc` has no native coordinates. Interim rule: `coord = chamber ID`
 * (the `'chamber-id'` coordinate schema); the real coordinate mapping is
 * `SDK_PLAN.md` decision #14 — a v1 blocker for the `cnc` converter.
 */
export const cnc = {
  name: 'cnc',
  size: 'per-chamber', // every ChamberData carries { width, height }
  terrains: [
    'desert oasis',
    'stone temple',
    'forest ruins',
    'mountain deep',
    'underwater keep',
    "ember's glow",
  ],
  coordinateSchema: 'chamber-id', // interim rule — real coordinate mapping: SDK_PLAN #14
  views: ['tokenCoord', 'chamberData'],
  attributes: {
    affinity: 'string',
    legendary: 'boolean',
    structure: ['crypt', 'cavern'],
    pointsOfInterest: 'number',
  },
} as const satisfies DataSchema;

/** The `cnc` terrain domain. */
export type CncTerrain = TerrainOf<typeof cnc>;

/** The `cnc` chamber attributes, typed from the descriptor. */
export type CncAttributes = AttributesOf<typeof cnc>;

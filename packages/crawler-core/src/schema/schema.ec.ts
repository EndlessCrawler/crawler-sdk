/**
 * The `ec` schema — Endless Crawler's 16×16 packed-coord chambers on Ethereum.
 * The descriptor is the single source of truth; the type level derives from it.
 */
import { Gem, Terrain } from '../chamber/constants';
import type { AttributesOf, DataSchema, TerrainOf } from './schema';

/**
 * The `ec` schema descriptor (see `SDK_SPECS.md` §Schemas).
 *
 * Fixed 16×16 size (chambers do not carry a size); NEWS coordinates; readable
 * string terrain/gem domains.
 */
export const ec = {
  name: 'ec',
  size: { width: 16, height: 16 }, // fixed → chambers do NOT carry a size
  terrains: ['earth', 'water', 'air', 'fire'], // Terrain value domain — readable strings
  coordinateSchema: 'news',
  views: ['tokenCoord', 'chamberData'], // views that CAN exist (optional per world)
  attributes: {
    // schema-local gameplay extras
    chapter: 'number',
    gemType: ['silver', 'gold', 'sapphire', 'emerald', 'ruby', 'diamond', 'ethernite', 'kao'],
    gemPos: 'tile',
    coins: 'number',
    worth: 'number',
  },
} as const satisfies DataSchema;

/** The `ec` terrain domain: `'earth' | 'water' | 'air' | 'fire'`. */
export type EcTerrain = TerrainOf<typeof ec>;

/** The `ec` gem domain (readable strings). */
export type EcGemType = (typeof ec)['attributes']['gemType'][number];

/** The `ec` chamber attributes, typed from the descriptor. */
export type EcAttributes = AttributesOf<typeof ec>;

/**
 * Chain terrain value → `ec` stored string. `Terrain.Empty` has no stored form
 * (no chamber is built from it).
 */
export const ecTerrainFromChain: Readonly<Partial<Record<Terrain, EcTerrain>>> = {
  [Terrain.Earth]: 'earth',
  [Terrain.Water]: 'water',
  [Terrain.Air]: 'air',
  [Terrain.Fire]: 'fire',
};

/**
 * Opposite terrains cannot connect to each other (earth/air, water/fire) —
 * the string-domain form of the chain's opposite-terrain relation.
 */
export const oppositeEcTerrain: Readonly<Record<EcTerrain, EcTerrain>> = {
  earth: 'air',
  air: 'earth',
  water: 'fire',
  fire: 'water',
};

/** Chain gem value → `ec` stored string — total over the mirrored `Gem` enum. */
export const ecGemFromChain: Readonly<Record<Gem, EcGemType>> = {
  [Gem.Silver]: 'silver',
  [Gem.Gold]: 'gold',
  [Gem.Sapphire]: 'sapphire',
  [Gem.Emerald]: 'emerald',
  [Gem.Ruby]: 'ruby',
  [Gem.Diamond]: 'diamond',
  [Gem.Ethernite]: 'ethernite',
  [Gem.Kao]: 'kao',
};

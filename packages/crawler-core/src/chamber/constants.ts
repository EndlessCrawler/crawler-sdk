/**
 * Chamber vocabulary — tiles, directions, terrains, gems.
 *
 * The numeric enums mirror the on-chain encoding (`Crawl.sol`) and are the
 * chain-value vocabulary used by converters and the data pipeline; *stored*
 * terrain/gem values in a world are readable strings declared by the schema
 * descriptor (see the `ec` schema).
 */

//------------------------------
// Tiles
//

/** Tile types inside a chamber's tilemap — values mirror the on-chain encoding. */
export enum TileType {
  //-------------------
  // original
  Void = 0x00, // walls
  Entry = 0x01,
  Exit = 0x02,
  LockedExit = 0x03,
  Gem = 0x04,
  //-------------------
  // proposed (not in use yet)
  HatchClosed = 0xf0,
  HatchDown = 0xf1,
  HatchUp = 0xf2,
  //-------------------
  // reserved
  Empty = 0xfe,
  Path = 0xff,
}

//------------------------------
// Directions
//

/**
 * A direction — NEWS-library vocabulary (see `coords/news`), plus the vertical
 * pair. Optional/aesthetic on doors ({@link ../world/types!Door}); games navigate
 * by door `destCoord`, never by direction math.
 */
export enum Dir {
  North = 0,
  East = 1,
  West = 2,
  South = 3,
  Over = 4,
  Under = 5,
}

/** Each direction's opposite (North/South, East/West, Over/Under). */
export const FlippedDir: Record<Dir, Dir> = {
  [Dir.North]: Dir.South,
  [Dir.East]: Dir.West,
  [Dir.West]: Dir.East,
  [Dir.South]: Dir.North,
  [Dir.Over]: Dir.Under,
  [Dir.Under]: Dir.Over,
};

/** Readable name of each direction — also the stored (serialized) form of a door's `direction`. */
export const DirNames: Record<Dir, string> = {
  [Dir.North]: 'North',
  [Dir.East]: 'East',
  [Dir.West]: 'West',
  [Dir.South]: 'South',
  [Dir.Over]: 'Over',
  [Dir.Under]: 'Under',
};

/**
 * @param dir the direction to flip
 * @returns the flipped {@link Dir} (North/South, East/West, Over/Under)
 */
export const flipDir = (dir: Dir): Dir => {
  return FlippedDir[dir];
};

//------------------------------
// Terrains
//

/**
 * Terrain chain values (`Crawl.sol` encoding). Stored terrain values are the
 * schema's readable strings (`'earth' | 'water' | 'air' | 'fire'` for `ec`);
 * this enum is the chain-side vocabulary converters map from.
 */
export enum Terrain {
  Empty = 0,
  Earth = 1,
  Water = 2,
  Air = 3,
  Fire = 4,
}

/** Opposite terrains cannot connect to each other (Earth/Air, Water/Fire). */
export const OppositeTerrain: Record<Terrain, Terrain> = {
  [Terrain.Empty]: Terrain.Empty,
  [Terrain.Earth]: Terrain.Air,
  [Terrain.Water]: Terrain.Fire,
  [Terrain.Air]: Terrain.Earth,
  [Terrain.Fire]: Terrain.Water,
};

/** Readable name of each terrain chain value. */
export const TerrainNames: Record<Terrain, string> = {
  [Terrain.Empty]: '',
  [Terrain.Earth]: 'Earth',
  [Terrain.Water]: 'Water',
  [Terrain.Air]: 'Air',
  [Terrain.Fire]: 'Fire',
};

/**
 * @param terrain the terrain to look up
 * @returns the opposite {@link Terrain} — opposite terrains cannot connect (Earth/Air, Water/Fire)
 */
export const getOppositeTerrain = (terrain: Terrain): Terrain => {
  return OppositeTerrain[terrain];
};

//-------------------
// Gem / Hoard
//

/**
 * Gem chain values (`Crawl.sol` encoding). Stored `gemType` values are the `ec`
 * schema's readable strings; this enum is the chain-side vocabulary.
 *
 * @remarks The chain encoding's `Coin`/`Count` sentinels (both `8`, "not a gem")
 * are deliberately not mirrored — they never denote a stored gem.
 */
export enum Gem {
  Silver = 0,
  Gold = 1,
  Sapphire = 2,
  Emerald = 3,
  Ruby = 4,
  Diamond = 5,
  Ethernite = 6,
  Kao = 7,
}

/** Readable name of each gem chain value. */
export const GemNames: Record<Gem, string> = {
  [Gem.Silver]: 'Silver',
  [Gem.Gold]: 'Gold',
  [Gem.Sapphire]: 'Sapphire',
  [Gem.Emerald]: 'Emerald',
  [Gem.Ruby]: 'Ruby',
  [Gem.Diamond]: 'Diamond',
  [Gem.Ethernite]: 'Ethernite',
  [Gem.Kao]: 'Kao',
};

/** The on-chain `Hoard` struct shape (`Crawl.sol`) — converter-input staging only. */
export interface Hoard {
  gemType: Gem;
  coins: number;
  worth: number;
}


//------------------------------
// Tiles
//

export enum TileType {
	//-------------------
	// original
	Void = 0x00,		// walls
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
export enum Dir {
	North = 0,
	East = 1,
	West = 2,
	South = 3,
	Over = 4,
	Under = 5,
}

export const FlippedDir = {
	[Dir.North]: Dir.South,
	[Dir.East]: Dir.West,
	[Dir.West]: Dir.East,
	[Dir.South]: Dir.North,
	[Dir.Over]: Dir.Under,
	[Dir.Under]: Dir.Over,
}

export const DirNames = {
	[Dir.North]: 'North',
	[Dir.East]: 'East',
	[Dir.West]: 'West',
	[Dir.South]: 'South',
	[Dir.Over]: 'Over',
	[Dir.Under]: 'Under',
}

/** @returns the flipped Dir (North/South, East/West, Over/Under) */
export const flipDir = (dir: Dir): Dir => {
	return FlippedDir[dir]
}


//------------------------------
// Terrains
//

export enum Terrain {
	Empty = 0,
	Earth = 1,
	Water = 2,
	Air = 3,
	Fire = 4,
}

export const OppositeTerrain = {
	[Terrain.Empty]: Terrain.Empty,
	[Terrain.Earth]: Terrain.Air,
	[Terrain.Water]: Terrain.Fire,
	[Terrain.Air]: Terrain.Earth,
	[Terrain.Fire]: Terrain.Water,
}

export const TerrainNames = {
	[Terrain.Empty]: '',
	[Terrain.Earth]: 'Earth',
	[Terrain.Water]: 'Water',
	[Terrain.Air]: 'Air',
	[Terrain.Fire]: 'Fire',
}

/** @returns Opposite terrains cannot connect to each other (Earth/Air, Wate/Fire) */
export const getOppositeTerrain = (terrain: Terrain): Terrain => {
	return OppositeTerrain[terrain]
}


//-------------------
// Gem / Hoard
//
export enum Gem {
	Silver = 0,
	Gold = 1,
	Sapphire = 2,
	Emerald = 3,
	Ruby = 4,
	Diamond = 5,
	Ethernite = 6,
	Kao = 7,
	// not a gem!
	Coin = 8,
	// gem count
	Count = 8,
}

export const GemNames = {
	[Gem.Silver]: 'Silver',
	[Gem.Gold]: 'Gold',
	[Gem.Sapphire]: 'Sapphire',
	[Gem.Emerald]: 'Emerald',
	[Gem.Ruby]: 'Ruby',
	[Gem.Diamond]: 'Diamond',
	[Gem.Ethernite]: 'Ethernite',
	[Gem.Kao]: 'Kao',
	[Gem.Coin]: 'Coin',
}

export interface Hoard {
	gemType: Gem
	coins: number
	worth: number
}

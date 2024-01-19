//------------------------------
// Constants
//

export enum Tile {
	Void = 0x00,
	Entry = 0x01,
	Exit = 0x02,
	LockedExit = 0x03,
	Gem = 0x04,
	HatchClosed = 0x05,
	HatchDown = 0x06,
	HatchUp = 0x07,
	Empty = 0xfe,
	Path = 0xff,
}

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


//-----------------------------------
// Directions
//

export const flipDir = (dir: Dir): Dir => {
	return FlippedDir[dir]
}

// Opposite terrains cannot connect to each other
// Earth <> Air / Water <> Fire
// equals to Crawl.getOppositeTerrain()
export const getOppositeTerrain = (terrain: Terrain): Terrain => {
	return OppositeTerrain[terrain]
}


//-----------------------------------
// Bitmap
//

export type uint4 = number
export type uint8 = number

export type BitmapPos = uint8
export type BitmapXY = {
	x: uint4
	y: uint4
}

export const bitmapPosToXY = (pos: BitmapPos): BitmapXY => {
	return {
		x: (pos % 16),
		y: Math.floor(pos / 16),
	}
}

export const bitmapXYToPos = (xy: BitmapXY): BitmapPos => {
	return (xy.y * 16 + xy.x)
}

export const flipDoorPositionXY = (xy: BitmapXY): BitmapXY => {
	if (xy.x === 0) return { x: 15, y: xy.y }
	if (xy.x == 15) return { x: 0, y: xy.y }
	if (xy.y === 0) return { x: xy.x, y: 15 }
	if (xy.y == 15) return { x: xy.x, y: 0 }
	console.warn(`flipDoorPositionXY() not a door:`, xy)
	return xy
}

export const flipDoorPosition = (pos: BitmapPos): BitmapPos => {
	return bitmapXYToPos(flipDoorPositionXY(bitmapPosToXY(pos)))
}

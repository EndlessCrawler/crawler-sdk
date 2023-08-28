import {
	Compass,
	BigIntString,
} from './types'
import { resolveBigInt } from './utils'

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
}

export const FlippedDir = {
	[Dir.North]: Dir.South,
	[Dir.East]: Dir.West,
	[Dir.West]: Dir.East,
	[Dir.South]: Dir.North,
}

export const DirNames = {
	[Dir.North]: 'North',
	[Dir.East]: 'East',
	[Dir.West]: 'West',
	[Dir.South]: 'South',
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
// coord (uint256 as bigint)
//
// A Chamber's coordinate is designated by North, East, West, South values (uint64)
// This 'Compass' is stored into an uint256 like this...
//
// North            West             East             South
// ffffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffff
//
// Directions are ALWAYS in NEWS order (North, East, West, South)
// just because it is catchy and easy to remember
//

// The maximum value in any Compass direction
export const CompassDirMax = 0xffffffffffffffffn // 64-bit, 18446744073709551615n, 18_446_744_073_709_551_615
export const CompassDirMaxNumber = Number(CompassDirMax) // 18446744073709552000

// coord bit mask for each Compass direction
export const CompassMask = {
	// mask of each directin inside uint256
	North: (CompassDirMax << 192n),
	East: (CompassDirMax << 128n),
	West: (CompassDirMax << 64n),
	South: CompassDirMax,
	// inverted masks
	InvNorth: ~(CompassDirMax << 192n),
	InvEast: ~(CompassDirMax << 128n),
	InvWest: ~(CompassDirMax << 64n),
	InvSouth: ~CompassDirMax,
}

// The number 1 in each Compass direction
export const CompassOne = {
	North: (1n << 192n),
	East: (1n << 128n),
	West: (1n << 64n),
	South: 1n,
}

export const offsetCoord = (coord: bigint, dir: Dir): bigint => {
	const _coord = resolveBigInt(coord) // convert to BigInt if in string format
	if (dir == Dir.North) {
		if ((_coord & CompassMask.South) > CompassOne.South) return _coord - CompassOne.South // --South
		if ((_coord & CompassMask.North) != CompassMask.North) return (_coord & CompassMask.InvSouth) + CompassOne.North // ++North
	} else if (dir == Dir.East) {
		if ((_coord & CompassMask.West) > CompassOne.West) return _coord - CompassOne.West // --West
		if ((_coord & CompassMask.East) != CompassMask.East) return (_coord & CompassMask.InvWest) + CompassOne.East // ++East
	} else if (dir == Dir.West) {
		if ((_coord & CompassMask.East) > CompassOne.East) return _coord - CompassOne.East // --East
		if ((_coord & CompassMask.West) != CompassMask.West) return (_coord & CompassMask.InvEast) + CompassOne.West // ++West
	} else if (dir == Dir.South) {
		if ((_coord & CompassMask.North) > CompassOne.North) return _coord - CompassOne.North // --North
		if ((_coord & CompassMask.South) != CompassMask.South) return (_coord & CompassMask.InvNorth) + CompassOne.South // ++South
	}
	return _coord
}



//-----------------------------------
// Compass, slug, converters
//

export const validateCompass = (compass: Compass | null): boolean => {
	if (!compass) return false
	const hasNorth = (compass.north && compass.north > 0)
	const hasSouth = (compass.south && compass.south > 0)
	const hasEast = (compass.east && compass.east > 0)
	const hasWest = (compass.west && compass.west > 0)
	if ((hasNorth && hasSouth)
		|| (!hasNorth && !hasSouth)
		|| (hasEast && hasWest)
		|| (!hasEast && !hasWest)
	) return false
	return true
}

export const minifyCompas = (compass: Compass | null): Compass | null => {
	if (!compass) return null
	//@ts-ignore to sort directions in NEWS order
	let result: Compass = {}
	if (compass?.north) result.north = compass.north
	if (compass?.south) result.south = compass.south
	if (compass?.east) result.east = compass.east
	if (compass?.west) result.west = compass.west
	return result
}

export const validateCoord = (coord: bigint): boolean => {
	return coordToCompass(coord) != null
}

export const validateSlug = (slug: string | null): boolean => {
	return slugToCompass(slug) != null
}

export const compassEquals = (a: Compass | null, b: Compass | null): boolean => {
	if (!a || !b) return false
	if (!validateCompass(a) || !validateCompass(b)) return false
	if (a.north && a.north > 0 && a.north !== b.north) return false
	if (a.east && a.east > 0 && a.east !== b.east) return false
	if (a.west && a.west > 0 && a.west !== b.west) return false
	if (a.south && a.south > 0 && a.south !== b.south) return false
	return true
}

export const coordToCompass = (coord: bigint): Compass | null => {
	const _coord = resolveBigInt(coord) // convert to BigInt if in string format
	if (_coord == 0n) return null
	const result = {
		north: Number((_coord & CompassMask.North) >> 192n),
		east: Number((_coord & CompassMask.East) >> 128n),
		west: Number((_coord & CompassMask.West) >> 64n),
		south: Number(_coord & CompassMask.South),
	} as Compass
	return validateCompass(result) ? result : null
}

export const compassToCoord = (compass: Compass | null): bigint => {
	let result = 0n
	if (compass) {
		if (compass.north && compass.north > 0) result += resolveBigInt(compass.north) << 192n
		if (compass.east && compass.east > 0) result += resolveBigInt(compass.east) << 128n
		if (compass.west && compass.west > 0) result += resolveBigInt(compass.west) << 64n
		if (compass.south && compass.south > 0) result += resolveBigInt(compass.south)
	}
	return result
}

export const slugSeparators = [null, '', ',', '.', ';', '-'] as const
export const defaultSlugSeparator = ','
export type SlugSeparator = typeof slugSeparators[number]

export const compassToSlug = (compass: Compass | null, separator: SlugSeparator = defaultSlugSeparator): string | null => {
	if (!compass || !validateCompass(compass)) return null
	let result = ''
	if (compass.north && compass.north > 0) result += `N${compass.north}`
	if (compass.south && compass.south > 0) result += `S${compass.south}`
	if (separator) result += separator
	if (compass.east && compass.east > 0) result += `E${compass.east}`
	if (compass.west && compass.west > 0) result += `W${compass.west}`
	return result
}

export const coordToSlug = (coord: bigint, separator: SlugSeparator = defaultSlugSeparator): string | null => {
	return compassToSlug(coordToCompass(coord), separator)
}

const _slugSeparatorTester: string = slugSeparators.join('') + '0123456789'
export const slugToCompass = (slug: string | null): Compass | null => {
	if (!slug) return null
	if (!/^[NnSs]\d+.{0,1}[EeWw]\d+$/g.exec(slug)) return null
	// match each direction
	const north = /[Nn]\d+/g.exec(slug)
	const east = /[Ee]\d+/g.exec(slug)
	const west = /[Ww]\d+/g.exec(slug)
	const south = /[Ss]\d+/g.exec(slug)
	// validate separator (will be a number if no separator)
	const separatorIndex: number = (east?.index ?? west?.index ?? 0) - 1
	if (separatorIndex < 0 || !_slugSeparatorTester.includes(slug.charAt(separatorIndex))) return null
	// build compass
	let result: any = {}
	if (north) result.north = parseInt(north[0].slice(1))
	if (east) result.east = parseInt(east[0].slice(1))
	if (west) result.west = parseInt(west[0].slice(1))
	if (south) result.south = parseInt(south[0].slice(1))
	return validateCompass(result) ? result : null
}

export const slugToCoord = (slug: string | null): bigint => {
	return compassToCoord(slugToCompass(slug))
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

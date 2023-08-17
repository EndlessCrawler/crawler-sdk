const BN = require('bn.js');

//--------------------------------
// Constants
//

/** @type supported networks */
export type NetworkName = 'mainnet' | 'goerli'

/** @type supported networks */
export enum ChainId {
	Mainnet = 1,
	Goerli = 5,
}

/** @type chain id to name lookup table */
export const chainIdToNetworkName: Record<ChainId, NetworkName> = {
	[1]: 'mainnet',
	[5]: 'goerli',
}

export const bn_one = new BN('1')
export const bn_zero = new BN('0')
export const bn_uint32_max = new BN('ffffffff', 16)					// '4294967295'
export const bn_uint64_max = new BN('ffffffffffffffff', 16)	// '18446744073709551615'
export const bn_mask_Dir = bn_uint64_max
export const bn_mask_North = bn_mask_Dir.shln(192)
export const bn_mask_East = bn_mask_Dir.shln(128)
export const bn_mask_West = bn_mask_Dir.shln(64)
export const bn_mask_South = bn_mask_Dir
export const bn_mask_NorthSouth = bn_mask_North.and(bn_mask_South)
export const bn_mask_EastWest = bn_mask_East.and(bn_mask_West)
export const bn_mask_NorthInv = bn_mask_North.notn(256)
export const bn_mask_EastInv = bn_mask_East.notn(256)
export const bn_mask_WestInv = bn_mask_West.notn(256)
export const bn_mask_SouthInv = bn_mask_South.notn(256)

export const int_max = Number.MAX_SAFE_INTEGER

export enum Dir {
	North = 0,
	East = 1,
	West = 2,
	South = 3,
}


//--------------------------------
// Types
//

/** @type ethereum address */
export type Address = `0x${string}`

/** @type big number as decimal string */
export type BNString = string

/** @type the compass coordinates of a chamber (NEWS) */
export interface Compass {
	north?: number
	east?: number
	west?: number
	south?: number
}


//--------------------------------
// View definitions
//

/** @type View names */
export enum ViewName {
	tokenIdToCoord = 'tokenIdToCoord',
	chamberData = 'chamberData',
}

export type AllViewsTypes = {
	[ViewName.tokenIdToCoord]: TokenIdToCoordsView
	[ViewName.chamberData]: ChamberDataView
}

/** @type All view types, by name */
export interface AllViews {
	[ViewName.tokenIdToCoord]: TokenIdToCoordsView
	[ViewName.chamberData]: ChamberDataView
}

//--------------------------------
// Views definitions
//

/** @type generic definition of a View */
export type View = Record<string | number, string | object>

/** @type tokenIdToCoord View */
export type TokenIdToCoordsView = Record<number, ChamberCoords>

/** @type chamberData View */
export type ChamberDataView = Record<BNString, ChamberData>


//--------------------------------
// View data interfaces
//

/** @type tokenIdToCoord */
export interface ChamberCoords {
	coord: BNString
	slug: string
	compass: Compass
}

/** @type chamberData */
export interface ChamberData {
	// static data
	tokenId: number
	chapter: number
	seed: BNString
	bitmap?: BNString
	tilemap?: BNString
	name: string
	compass: Compass
	coord: BNString
	yonder: number
	terrain: number
	entryDir: number
	gemPos: number
	gemType: number
	coins: number
	worth: number
	// TODO: Remove this? (not static)
	doors: number[]
	locks: boolean[]
	isStatic: boolean
}


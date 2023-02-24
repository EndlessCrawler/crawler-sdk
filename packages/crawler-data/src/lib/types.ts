
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


//--------------------------------
// Types
//

/** @type ethereum address */
export type Address = string

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
	bitmap: BNString
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


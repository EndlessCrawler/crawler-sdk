
//--------------------------------
// Constants
//

/** @type supported networks */
export enum NetworkName {
	Mainnet = 'mainnet',
	Goerli = 'goerli',
	// Sepolia = 'sepolia',
}

/** @type supported networks */
export enum ChainId {
	Mainnet = 1,
	Goerli = 5,
	// Sepolia = 11155111,
}

/** @type chain id to name lookup */
export const ChainIdToNetworkName: Record<ChainId, NetworkName> = {
	[ChainId.Mainnet]: NetworkName.Mainnet,
	[ChainId.Goerli]: NetworkName.Goerli,
	// [ChainId.Sepolia]: NetworkName.Sepolia,
}


//--------------------------------
// Contracts
//

/** @type ethereum address  */
export type Address = string

/** @type all contract addresses of a network */
export interface ContractAddresses {
	crawlerToken: Address
	cardsMinter: Address
}



//--------------------------------
// Crawler Types
//

//
// Compass and coors

export type AbsentDir = 0 | null | undefined

export interface CompassNE {
	north: number
	east: number
	west?: AbsentDir
	south?: AbsentDir
}

export interface CompassNW {
	north: number
	east?: AbsentDir
	west: number
	south?: AbsentDir
}

export interface CompassSE {
	north?: AbsentDir
	east: number
	west?: AbsentDir
	south: number
}

export interface CompassSW {
	north?: AbsentDir
	east?: AbsentDir
	west: number
	south: number
}

export type Compass = CompassNE | CompassNW | CompassSE | CompassSW


//--------------------------------
// View content types
//

/** @type big number as decimal string */
export type BNString = string

/** @type all the coordinates of a chamber */
export interface ChamberCoords {
	coord: BNString
	slug: string
	compass: Compass
}

/** @type all static data of a chamber  */
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
	tilemap: number[]
	doors: number[]
	locks: boolean[]
	locksCount: number
	isStatic: boolean
}


//--------------------------------
// View definitions
//

/** @type View names */
export enum ViewName {
	tokenIdToCoord = 'tokenIdToCoord',
	chamberData = 'chamberData',
}

/** @type generic definition of a View */
export type View = Record<string | number, string | object>

/** @type tokenIdToCoord View */
export type TokenIdToCoordsView = Record<number, ChamberCoords>

/** @type chamberData View */
export type ChamberDataView = Record<BNString, ChamberData>

/** @type All view types, by name */
export interface AllViews {
	[ViewName.tokenIdToCoord]: TokenIdToCoordsView
	[ViewName.chamberData]: ChamberDataView
}



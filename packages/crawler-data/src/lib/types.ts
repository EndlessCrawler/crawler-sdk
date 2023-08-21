
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
// Misc
//

/** @type hex string starting with 0x */
// export type HexString = `0x${string}` // not good for view types when converting from json
export type HexString = string

/** @type BigInt as decimal string */
export type BigIntString = string

/** @type ethereum address (hex string) */
export type Address = string

/** @type types that can contain a BigInt */
export type AnyBigInt = number | bigint | BigIntString | HexString



//--------------------------------
// Contracts
//

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

/** @type all the coordinates of a chamber */
export interface ChamberCoords {
	coord: BigIntString
	slug: string
	compass: Compass
}

/** @type all static data of a chamber  */
export interface ChamberData {
	// static data
	tokenId: number
	chapter: number
	seed: HexString
	bitmap: HexString
	name: string
	compass: Compass
	coord: BigIntString
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
export type TokenIdToCoordsView = Record<BigIntString, ChamberCoords>

/** @type chamberData View */
export type ChamberDataView = Record<BigIntString, ChamberData>

/** @type All view types, by name */
export interface AllViews {
	[ViewName.tokenIdToCoord]: TokenIdToCoordsView
	[ViewName.chamberData]: ChamberDataView
}

/** @type The actual data from a chain */
export interface ChainData {
	chainId: ChainId
	data: AllViews
}



//--------------------------------
// ChamberData access
//

/** @type Base arguments containing just the chain id */
export interface Options {
	chainId?: ChainId
}



//--------------------------------
// custom throw errors
//

export class InvalidCrawlerChainError extends Error {
	constructor(chainId: ChainId) {
		super(`InvalidCrawlerChainError: Chain not imported. Did you forget to call importChainData(${chainId}) ?`)
		this.name = 'InvalidCrawlerChainError'
	}
}

export class CrawlerChainNotSetError extends Error {
	constructor() {
		super(`CrawlerChainNotSetError: No chain imported. Did you forget to call importChainData() ?`)
		this.name = 'CrawlerChainNotSetError'
	}
}

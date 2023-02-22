
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

/** @type chain id to name lookup */
export const ChainIdToNetworkName: Record<ChainId, NetworkName> = {
	[1]: 'mainnet',
	[5]: 'goerli',
}

/** @type supported networks */
export enum ViewName {
	tokenIdToCoord = 'tokenIdToCoord',
	chamberData = 'chamberData',
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

/** @type big number as decimal string */
export type BNString = string

/** @type the compass coordinates of a chamber (NEWS) */
export interface Compass {
	north?: number
	east?: number
	west?: number
	south?: number
}

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
	doors: number[]
	locks: boolean[]
	locksCount: number
}

//--------------------------------
// Crawler Views
//

/** @type all cached data of a network  */
export interface AllChambersViews {
	contractAddress: Address
	tokenIdToCoord: TokenIdToCoordsView
	chamberData: ChamberDataView
}

export type View = Record<string | number, string | object>

/** @type cached data by token id  */
export type TokenIdToCoordsView = Record<number, ChamberCoords>

/** @type cached data by coordinate  */
export type ChamberDataView = Record<BNString, ChamberData>


import {
	ChainId,
} from "./chains"
import {
	CompassBase,
	ModuleId,
} from "../modules"
import {
	DataSetName,
} from "../views"


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

/** @type types that can represent a BigInt */
export type BigIntIsh = number | bigint | BigIntString | HexString


/** @type arguments for locating some view or value */
export interface Options {
	chainId?: ChainId			// deprecated
	moduleId?: ModuleId
	dataSetName?: DataSetName
}



//--------------------------------
// ChamberData access
//

/** @type all the coordinates of a chamber */
export interface ChamberCoords {
	coord: BigIntString
	slug: string
	compass: CompassBase
}

// TODO: MOVE TO ModuleBase
/** @type all static data of a chamber  */
export interface ChamberData {
	// static data
	tokenId: number
	chapter: number
	seed: HexString
	bitmap?: HexString
	name: string
	compass: CompassBase
	coord: BigIntString
	yonder: number
	terrain: number
	entryDir: number
	gemPos: number
	gemType: number
	coins: number
	worth: number
	// TODO: Remove this? (not static)
	tilemap?: number[]
	doors: number[]
	locks: boolean[]
	locksCount: number
	isDynamic: boolean
}

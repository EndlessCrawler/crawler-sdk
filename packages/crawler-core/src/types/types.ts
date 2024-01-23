import {
	CompassBase,
	ModuleId,
} from "../modules"
import {
	DataSetName,
	ChainId,
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
export type BigIntIsh = bigint | number | BigIntString | HexString


/** @type arguments for locating some view or value */
export interface Options {
	chainId?: ChainId			// deprecated
	moduleId?: ModuleId
	dataSetName?: DataSetName
}


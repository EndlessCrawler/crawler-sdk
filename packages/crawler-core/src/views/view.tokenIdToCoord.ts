import {
	BigIntString,
	ChamberCoords,
	Options,
} from "../types";
import {
	ViewAccessInterface,
	ViewName,
	ViewT,
} from "./view";
import {
	ModuleBase,
} from "../modules";

/** @type keys of TokenIdToCoord view */
export type TokenIdToCoordViewKey = BigIntString | bigint | number
/** @type keys of TokenIdToCoord view */
export type TokenIdToCoordViewValue = ChamberCoords
/** @type TokenIdToCoord view record (key/value pair) */
export type TokenIdToCoordsViewRecords = {
	[key in TokenIdToCoordViewKey as string]: TokenIdToCoordViewValue
}

export class TokenIdToCoordViewAccess implements ViewAccessInterface<TokenIdToCoordViewKey, TokenIdToCoordViewValue> {

	viewName = ViewName.tokenIdToCoord;
	module: ModuleBase;

	constructor(module: ModuleBase) {
		this.module = module
	}

	getView(options: Options = {}): ViewT<TokenIdToCoordsViewRecords> {
		return this.module.getView(this.viewName, options)
	}

	getData(options: Options = {}): TokenIdToCoordsViewRecords {
		return this.getView(options).data
	}

	getCount(options: Options = {}): number {
		return Object.keys(this.getView(options).data).length
	}

	get(key: TokenIdToCoordViewKey, options: Options = {}): TokenIdToCoordViewValue | null {
		return this.getView(options).data[String(key)] ?? null
	}

	push(key: TokenIdToCoordViewKey, value: TokenIdToCoordViewValue, options: Options = {}): void {
		this.getView(options).data[String(key)] = value
	}

	/**
	 * @param tokenIds the token ids
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns the coordinates of multiple chambers
	 */
	getTokensCoords(tokenIds: number[], options: Options = {}): TokenIdToCoordsViewRecords {
		const data = this.getData(options)
		return Object.entries(data).reduce(function (result, [key, value]) {
			const tokenId = parseInt(key)
			if (tokenIds.includes(tokenId)) {
				result[tokenId] = value
			}
			return result
		}, {} as TokenIdToCoordsViewRecords)
	}

}
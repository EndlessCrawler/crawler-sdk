import {
	BigIntString,
	Options,
} from "../types";
import {
	ViewAccessInterface,
	ViewName,
	ViewT,
	ViewValue,
} from "./view";
import {
	CompassBase,
	ModuleInterface,
} from "../modules";
import {
	EventName,
	__emitEvent,
} from "../modules/events";


/** @type all the coordinates of a chamber */
export interface ChamberCoordsModel {
	coord: bigint
}

/** @type all the coordinates of a chamber */
export interface ChamberCoords extends ViewValue {
	coord: BigIntString
	slug: string
	compass: CompassBase
}


/** @type keys of TokenIdToCoord view */
export type TokenIdToCoordViewKey = BigIntString | bigint | number
/** @type keys of TokenIdToCoord view */
export type TokenIdToCoordViewValue = ChamberCoords
/** @type TokenIdToCoord view record (key/value pair) */
export type TokenIdToCoordsViewRecords = {
	[key in TokenIdToCoordViewKey as string]: TokenIdToCoordViewValue
}

export class TokenIdToCoordViewAccess implements ViewAccessInterface<TokenIdToCoordViewKey, TokenIdToCoordViewValue, ChamberCoordsModel, TokenIdToCoordsViewRecords> {

	viewName = ViewName.tokenIdToCoord;
	module: ModuleInterface;

	constructor(module: ModuleInterface) {
		this.module = module
	}

	getView(options: Options = {}): ViewT<TokenIdToCoordsViewRecords> {
		return this.module.getView(this.viewName, options)
	}

	getData(options: Options = {}): TokenIdToCoordsViewRecords {
		return this.getView(options).records
	}

	getCount(options: Options = {}): number {
		return Object.keys(this.getView(options).records).length
	}

	get(key: TokenIdToCoordViewKey, options: Options = {}): TokenIdToCoordViewValue | null {
		return this.getView(options).records[String(key)] ?? null
	}

	set(key: TokenIdToCoordViewKey, model: ChamberCoordsModel, options: Options = {}): void {
		this.getView(options).records[String(key)] = this.transform(model)
		__emitEvent(EventName.ViewRecordChanged, { key })
	}

	transform(model: ChamberCoordsModel): ChamberCoords {
		const coord = model.coord
		const compass = this.module.coordToCompass(coord)
		return {
			coord: coord.toString(),
			slug: this.module.compassToSlug(compass) as string,
			compass: this.module.minifyCompass(compass) as CompassBase,
		}
	}

	/**
	 * @param tokenIds the token ids
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns the coordinates of multiple chambers
	 */
	getTokensCoords(tokenIds: bigint[], options: Options = {}): TokenIdToCoordsViewRecords {
		const data = this.getData(options)
		return Object.entries(data).reduce(function (result, [key, value]) {
			const tokenId = BigInt(key)
			if (tokenIds.includes(tokenId)) {
				result[String(tokenId)] = value
			}
			return result
		}, {} as TokenIdToCoordsViewRecords)
	}

}
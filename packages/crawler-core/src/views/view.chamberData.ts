import {
	Options,
	ViewName,
	ViewT,
	ChamberData,
	BigIntString,
	ViewAccessInterface,
	ModuleBase,
} from '..'

/** @type keys of ChamberData view */
export type ChamberDataViewKey = BigIntString
/** @type values of ChamberData view */
export type ChamberDataViewValue = ChamberData
/** @type ChamberData view record (key/value pair) */
export type ChamberDataViewRecords = {
	[key in ChamberDataViewKey]: ChamberDataViewValue
}

export class ChamberDataViewAccess implements ViewAccessInterface<ChamberDataViewKey, ChamberDataViewValue> {

	viewName = ViewName.chamberData;
	module: ModuleBase;

	constructor(module: ModuleBase) {
		this.module = module
	}

	getView(options: Options): ViewT<ChamberDataViewRecords> {
		return this.module.getView(this.viewName, options)
	}

	getData(options: Options): ChamberDataViewRecords {
		return this.getView(options).data
	}

	getCount(options: Options): number {
		return Object.keys(this.getView(options).data).length
	}

	get(key: ChamberDataViewKey, options: Options): ChamberDataViewValue | null {
		return this.getView(options).data[key]
	}

	push(key: ChamberDataViewKey, value: ChamberDataViewValue, options: Options): void {
		this.getView(options).data[key] = value
	}

	/**
	 * @param coord chamber coordinate (bigint)
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns ChamberData of the chamber
	 */
	getChamberData(coord: BigIntString, options: Options = {}): ChamberData | null {
		const data = this.getData(options)
		return data[coord] ?? null
	}

	/**
	 * @param coords chambers coordinates (bigint)
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns ChamberData of multiple chambers
	 */
	getChambersData(coords: BigIntString[], options: Options = {}): ChamberDataViewRecords {
		const data = this.getData(options)
		return Object.entries(data).reduce((acc, [key, value]) => {
			if (coords.includes(key)) {
				acc[key] = value
			}
			return acc
		}, {} as ChamberDataViewRecords)
	}

	/**
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns total static chambers count
	 */
	getStaticChamberCount(options: Options = {}): number {
		const data = this.getData(options)
		return Object.values(data).reduce((acc, value) => {
			return value.isDynamic ? acc : acc + 1
		}, 0)
	}

	/**
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns total edge chambers count
	 */
	getDynamicChamberCount(options: Options = {}): number {
		const data = this.getData(options)
		return Object.values(data).reduce((acc, value) => {
			return value.isDynamic ? acc + 1 : acc
		}, 0)
	}

	/**
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns total edge chambers count
	 */
	getDynamicChambersCoords(options: Options = {}): bigint[] {
		const data = this.getData(options)
		return Object.values(data).reduce((acc, value) => {
			if (value.isDynamic) {
				acc.push(BigInt(value.coord))
			}
			return acc
		}, [] as bigint[])
	}

	/**
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns total edge chambers count
	 */
	getDynamicChambersIds(options: Options = {}): number[] {
		const data = this.getData(options)
		return Object.values(data).reduce((acc, value) => {
			if (value.isDynamic) {
				acc.push(value.tokenId)
			}
			return acc
		}, [] as number[])
	}

}

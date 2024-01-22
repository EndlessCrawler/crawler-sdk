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
export type ChamberDataViewKey = BigIntString | bigint
/** @type values of ChamberData view */
export type ChamberDataViewValue = ChamberData
/** @type ChamberData view record (key/value pair) */
export type ChamberDataViewRecords = {
	[key in ChamberDataViewKey as string]: ChamberDataViewValue
}

export class ChamberDataViewAccess implements ViewAccessInterface<ChamberDataViewKey, ChamberDataViewValue> {

	viewName = ViewName.chamberData;
	module: ModuleBase;

	constructor(module: ModuleBase) {
		this.module = module
	}

	getView(options: Options = {}): ViewT<ChamberDataViewRecords> {
		return this.module.getView(this.viewName, options)
	}

	getData(options: Options = {}): ChamberDataViewRecords {
		return this.getView(options).data
	}

	getCount(options: Options = {}): number {
		return Object.keys(this.getView(options).data).length
	}

	get(key: ChamberDataViewKey, options: Options = {}): ChamberDataViewValue | null {
		return this.getView(options).data[String(key)]
	}

	push(key: ChamberDataViewKey, value: ChamberDataViewValue, options: Options = {}): void {
		this.getView(options).data[String(key)] = value
	}

	/**
	 * @param coords chambers coordinates (bigint)
	 * @param options.chainId the network chain id (1 or 5)
	 * @returns ChamberData of multiple chambers
	 */
	getMultiple(coords: ChamberDataViewKey[], options: Options = {}): ChamberDataViewRecords {
		const data = this.getData(options)
		const _coord = coords.map(x => String(x))
		return _coord.reduce((acc, key) => {
			if (data[key]) {
				acc[key] = data[key]
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

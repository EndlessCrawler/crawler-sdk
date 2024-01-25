import {
	BigIntIsh,
	BigIntString,
	HexString,
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
	Utils,
} from "../utils";
import {
	Dir,
	Hoard,
	Terrain,
	TileType,
	Bitmap,
	Gem,
} from "../crawler";
import {
	EventName,
	__emitEvent,
} from "../modules/events";


//
// Endless Crawler Solidity Model
// (Crawl.sol)
//
// struct ChamberData {
// 	uint256 coord;
// 	uint256 tokenId;
// 	uint256 seed;
// 	uint232 yonder;
// 	uint8 chapter;			// Chapter minted
// 	Crawl.Terrain terrain;
// 	Crawl.Dir entryDir;
// 	Crawl.Hoard hoard;
// 	uint8 gemPos;				// gem bitmap position
// 	// dynamic until all doors are unlocked
// 	uint8[4] doors; 		// bitmap position in NEWS order
// 	uint8[4] locks; 		// lock status in NEWS order
// 	// optional
// 	uint256 bitmap;			// bit map, 0 is void/walls, 1 is path
// 	bytes tilemap;			// tile map
// 	// custom data
// 	CustomData[] customData;
// }
// struct Hoard {
// 	Crawl.Gem gemType;
// 	uint16 coins;		// coins value
// 	uint16 worth;		// gem + coins value
// }


/** @type input model used to build ChamberData */
export interface ChamberDataModel {
	chapter?: number
	tokenId?: BigIntIsh	// if absent, try to get from coord
	name?: string
	coord: BigIntIsh
	yonder?: BigIntIsh
	entryDir?: Dir			// if absent, try to get from tilemap + doors
	seed: BigIntIsh
	doors: number[]			// ordered as in Dir
	locks: number[]			// ordered as in Dir
	tilemap: Bitmap.TilemapIsh
	// optionals
	bitmap?: Bitmap.BitmapIsh
	terrain?: Terrain
	gemPos?: number
	hoard?: Hoard
	isDynamic?: boolean	// if absent, try to get from locked doors
}

/** @type all static data of a chamber  */
export interface ChamberData extends ViewValue {
	// static data
	chapter: number
	tokenId: BigIntIsh
	name: string
	compass: CompassBase
	coord: BigIntIsh
	yonder: BigIntIsh
	seed: HexString
	entryDir: Dir
	doors: number[]					// dynamic
	locks: boolean[]				// dynamic
	tilemap: Bitmap.Tilemap	// dynamic
	bitmap?: Bitmap.Bitmap
	terrain?: Terrain
	gemPos?: number
	gemType?: Gem
	coins?: number
	worth?: number
	isDynamic?: boolean			// when true, record can be updated
}


/** @type keys of ChamberData view */
export type ChamberDataViewKey = BigIntString | bigint
/** @type values of ChamberData view */
export type ChamberDataViewValue = ChamberData
/** @type ChamberData view record (key/value pair) */
export type ChamberDataViewRecords = {
	[key in ChamberDataViewKey as string]: ChamberDataViewValue
}

export class ChamberDataViewAccess implements ViewAccessInterface<ChamberDataViewKey, ChamberDataViewValue, ChamberDataModel, ChamberDataViewRecords> {

	viewName = ViewName.chamberData;
	module: ModuleInterface;

	constructor(module: ModuleInterface) {
		this.module = module
	}

	getView(options: Options = {}): ViewT<ChamberDataViewRecords> {
		return this.module.getView(this.viewName, options)
	}

	getData(options: Options = {}): ChamberDataViewRecords {
		return this.getView(options).records
	}

	getCount(options: Options = {}): number {
		return Object.keys(this.getView(options).records).length
	}

	get(key: ChamberDataViewKey, options: Options = {}): ChamberDataViewValue | null {
		return this.getView(options).records[String(key)]
	}

	set(key: ChamberDataViewKey, model: ChamberDataModel, options: Options = {}): void {
		this.getView(options).records[String(key)] = this.transform(model)
		__emitEvent(EventName.ViewRecordChanged, { key })
	}

	// implement transform() as static to be used outside the View
	transform(model: ChamberDataModel): ChamberData {
		const coord = Utils.toBigInt(model.coord)
		const compass = this.module.minifyCompass(this.module.coordToCompass(coord)) as CompassBase
		const tilemap = Bitmap.toTilemap(model.tilemap ?? 0)
		const doors = model.doors ?? []
		// get entryDir from tilemap and doors, if absent
		let entryDir = model.entryDir
		if (entryDir == null) {
			const entryPos = Bitmap.findTilesInTilemap(tilemap, [TileType.Entry])[0]
			if (entryPos) {
				const i = doors.indexOf(entryPos)
				if (i >= 0) {
					entryDir = i as Dir
				}
			}
			if (entryDir == null) {
				console.warn(`Door not found for Entry tile pos [${entryPos}], fallback entry to Dir.Over.`, doors, compass)
				entryDir = Dir.Over
			}
		}
		// Determine dinamic from locks
		const locks: boolean[] = model.locks.map((v: number) => v != 0)
		const locksCount: number = locks.reduce<number>((acc: number, val: boolean) => { return acc + (val ? 1 : 0) }, 0)
		const isDynamic = (model.isDynamic || locksCount > 0) ? true : undefined
		// contruct ChamberData
		const chamberData: ChamberData = {
			compass,
			coord,
			seed: Utils.bigIntToHex(model.seed),
			bitmap: model.bitmap ? Bitmap.toBitmap(model.bitmap ?? 0) : undefined,
			tilemap,
			tokenId: Utils.toBigInt(model.tokenId ?? compass.tokenId ?? 0n),
			yonder: Utils.toBigInt(model.yonder ?? 1n),
			name: model.name ?? `Chamber #${model.tokenId}`,
			chapter: model.chapter ?? 0,
			terrain: model.terrain,
			entryDir,
			gemPos: model.gemPos,
			gemType: model.hoard?.gemType,
			coins: model.hoard?.coins,
			worth: model.hoard?.worth,
			doors,
			locks,
			isDynamic,
		}
		return Utils.minifyObject(chamberData)
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
	getDynamicChambersIds(options: Options = {}): bigint[] {
		const data = this.getData(options)
		return Object.values(data).reduce((acc, value) => {
			if (value.isDynamic) {
				acc.push(Utils.toBigInt(value.tokenId))
			}
			return acc
		}, [] as bigint[])
	}

}

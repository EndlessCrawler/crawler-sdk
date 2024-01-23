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
	toBigInt,
	bigIntToHex,
	minifyObject,
} from "../utils";
import {
	Dir,
	Hoard,
	Terrain,
	TileType,
	Bitmap,
} from "../crawler";


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
	chapter: number
	tokenId: BigIntIsh
	name?: string
	coord: BigIntIsh
	yonder: BigIntIsh
	seed: BigIntIsh
	bitmap: Bitmap.BitmapIsh
	tilemap: Bitmap.TilemapIsh
	terrain: Terrain
	entryDir: Dir
	gemPos: number
	hoard: Hoard
	doors: number[]
	locks: number[]
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
	bitmap: Bitmap.Bitmap
	terrain: number
	entryDir: number
	gemPos: number
	gemType: number
	coins: number
	worth: number
	// (static, can still change while isDynamic is true)
	tilemap: Bitmap.Tilemap
	doors: number[]
	locks: boolean[]
	locksCount: number
	isDynamic: boolean
}


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

	push(key: ChamberDataViewKey, value: ChamberDataViewValue, options: Options = {}): void {
		this.getView(options).records[String(key)] = value
	}

	// implement transform() as static to be used outside the View
	transform(model: ChamberDataModel): ChamberData {
		const locks: boolean[] = model.locks.map((v: number) => v != 0)
		const locksCount: number = locks.reduce<number>((acc: number, val: boolean) => { return acc + (val ? 1 : 0) }, 0)
		const chamberData: ChamberData = {
			compass: this.module.minifyCompass(this.module.coordToCompass(toBigInt(model.coord))) as CompassBase,
			coord: toBigInt(model.coord),
			seed: bigIntToHex(model.seed),
			bitmap: Bitmap.toBitmap(model.bitmap ?? 0),
			tilemap: Bitmap.toTilemap(model.tilemap ?? 0),
			tokenId: toBigInt(model.tokenId),
			yonder: toBigInt(model.yonder),
			name: model.name ?? `Chamber #${model.tokenId}`,
			chapter: model.chapter,
			terrain: model.terrain,
			entryDir: model.entryDir,
			gemPos: model.gemPos,
			gemType: model.hoard.gemType,
			coins: model.hoard.coins,
			worth: model.hoard.worth,
			doors: model.doors,
			locks,
			locksCount,
			isDynamic: (locksCount > 0),
		}
		return minifyObject(chamberData)
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
				acc.push(toBigInt(value.tokenId))
			}
			return acc
		}, [] as bigint[])
	}

}

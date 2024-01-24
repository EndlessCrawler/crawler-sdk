import {
	BigIntIsh,
	HexString,
} from "../types"
import { Utils } from "../utils"
import { TileType } from "./constants"

export namespace Bitmap {

	/** @type anything that can be covert to Bitmap */
	export type BitmapIsh = BigIntIsh

	/** @type the internal bitmap representation */
	export type Bitmap = HexString

	/** @type anything that can be covert to Bitmap */
	export type TilemapIsh = Tilemap | BigIntIsh

	/** @type the internal bitmap representation */
	export type Tilemap = TileType[]

	/** @type the size of bitmap (grid) */
	export interface Size {
		width: number
		height: number
	}

	/** @type default size of a u256 bitmap */
	export const bitmapSize: Size = {
		width: 16,
		height: 16,
	}

	/** @type xy position inside a bitmap */
	export interface Xy {
		x: number
		y: number
	}

	/** @type tile position inside a bitmap (y * width + x) */
	export type Tile = number

	/** @returns true if the value is a Tile, false if XY */
	export const isTile = (pos: Xy | Tile) => (typeof pos === 'number')

	/** @returns a bitmap tile converted to XY */
	export const tileToXy = (pos: Tile, size: Size = bitmapSize): Xy => {
		return {
			x: (pos % size.width),
			y: Math.floor(pos / size.width),
		}
	}

	/** @returns a bitmap XY position converted to tile */
	export const xyToTile = (xy: Xy, size: Size = bitmapSize): Tile => {
		return (xy.y * size.width + xy.x)
	}

	/** @returns a flipped door position inside  */
	export const flipDoorPosition = <T extends Xy | Tile>(pos: T, size: Size = bitmapSize): T => {
		let result: Xy = isTile(pos) ? tileToXy(pos as Tile) : pos as Xy
		if (result.x === 0) result = { x: size.width - 1, y: result.y }
		else if (result.x == size.width - 1) result = { x: 0, y: result.y }
		else if (result.y === 0) result = { x: result.x, y: size.height - 1 }
		else if (result.y == size.height - 1) result = { x: result.x, y: 0 }
		//@ts-ignore
		return isTile(pos) ? xyToTile(result) as Tile : result as Xy
	}

	// /** @returns converts anything to Bitmap */
	// export type BitmapIsh = BigIntIsh | BigIntIsh[] | number[] | boolean[]
	// export type Bitmap = HexString | HexString[]
	// export const toBitmap = (bmp: BitmapIsh, size: Size = bitmapSize): Bitmap => {
	// 	// BigIntIsh[] | number[] | boolean[]
	// 	if(Array.isArray(bmp)) {
	// 		if (bmp.length == 0) {
	// 			Utils.bigIntToHex(0)
	// 		}
	// 		// BigIntIsh[]
	// 		if (Utils.isString(bmp[0]) || Utils.isBigInt(bmp[0])) {
	// 			if(bmp.length == 0) {
	// 				// single bigint
	// 				return Utils.bigIntToHex(bmp[0] as BigIntIsh)
	// 			}
	// 			// multiple bigints
	// 			return bmp.map(v => Utils.bigIntToHex(v as BigIntIsh))
	// 		}
	// 		// number[] | boolean[]
	// 		let bigints: bigint[] = Array(Math.ceil(bmp.length / 256)).fill(0n)
	// 		for (let n = 0; n < bmp.length; n += 256) {
	// 			let slice = bmp.slice(n, n + 256) as number[] | boolean[]
	// 			bigints.push(Utils.binaryArrayToBigInt(slice))
	// 		}
	// 		if (bigints.length == 1) {
	// 			// single bigint
	// 			return Utils.bigIntToHex(bigints[0])
	// 		}
	// 		// multiple bigints
	// 		return bigints.map(v => Utils.bigIntToHex(v))
	// 	}
	// 	// BigIntIsh
	// 	return Utils.bigIntToHex(bmp as BigIntIsh)
	// }

	/** @returns converts anything to Bitmap */
	export const toBitmap = (bmp: BitmapIsh): Bitmap => {
		return Utils.bigIntToHex(bmp as BigIntIsh)
	}

	/** @returns converts anything to Tilemap */
	export const toTilemap = (tmp: TilemapIsh): Tilemap => {
		if (Array.isArray(tmp)) {
			return tmp
		}
		// bytes packed inside BigIntIsh
		return Utils.bigIntToNumberArray(tmp)
	}

}

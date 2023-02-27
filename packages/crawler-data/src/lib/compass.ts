import * as T from './types'

// import { Crawl } from '@/Crawl'
// const { ethers } = require('ethers')
const BN = require('bn.js')

//
// Compass is a coordinate object
// { north, east, west, south }
//
// TODO:
// Use BN or BigInt
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
//


// Validate a compass
const validate = (compass: any): boolean => {
	if (!compass) return false
	if (compass.north && compass.south) return false
	if (!compass.north && !compass.south) return false
	if (compass.east && compass.west) return false
	if (!compass.east && !compass.west) return false
	return true
}

const validateCoord = (value: T.BNString | null): boolean => {
	return validate(fromBN(value))
}

const isBN = (value: any): boolean => {
	return BN.isBN(value) || value instanceof BN
}

const bnToNumber = (value: typeof BN): number => {
	if (value.gt(T.bn_uint32_max)) {
		console.warn(`BN too big for int32`, value.toJSON())
		return T.bn_uint32_max.toNumber()
	}
	return value.toNumber()
}

const fromBN = (value: typeof BN | string) => {
	const bn = isBN(value) ? value : new BN(value)
	return {
		north: bnToNumber(bn.shrn(192).and(T.bn_mask_Dir)),
		east: bnToNumber(bn.shrn(128).and(T.bn_mask_Dir)),
		west: bnToNumber(bn.shrn(64).and(T.bn_mask_Dir)),
		south: bnToNumber(bn.and(T.bn_mask_Dir)),
	}
}

// Covert Compass to BN coord
// input can be compass { north, east, ... } or coord (BN)
const toBN = (compass_or_coord: T.Compass | typeof BN): typeof BN | null => {
	if (isBN(compass_or_coord)) {
		return compass_or_coord
	}
	if (validate(compass_or_coord)) {
		return fromBN(compass_or_coord)
	}
	return null
}
// Format coord as BN String
// used as smart contract function arguments
const toBigString = (compass_or_coord: T.Compass | typeof BN): T.BNString => {
	let bn = toBN(compass_or_coord)
	return (bn ? bn.toString() : '0')
}

// convert compass to string: N1,E1
const _separator = ','
const toString = (compass: T.Compass, separator: string | null = _separator): string => {
	if (!validate(compass)) return '?'
	let result = ''
	result += (compass.south ? `S${compass.south}` : `N${compass.north}`)
	if (separator) result += separator
	result += (compass.west ? `W${compass.west}` : `E${compass.east}`)
	return result
}

// convert compass to slug string: N1E1
const toSlug = (compass: T.Compass): string => {
	return toString(compass, null)
}

// convert compass to latitude string: N1 / S1
const toStringLat = (compass: T.Compass): string => {
	const parts = toString(compass).split(_separator)
	return parts.length == 2 ? parts[0] : ''
}

// convert compass to longitute string: E1 / W1
const toStringLong = (compass: T.Compass): string => {
	const parts = toString(compass).split(_separator)
	return parts.length == 2 ? parts[1] : ''
}

// input is any Compass.toString() result
// ex: S1E1, N12W44, S4 E4
const fromString = (input: string): T.Compass | null => {
	const north = /[Nn]\d+/g.exec(input)
	const east = /[Ee]\d+/g.exec(input)
	const west = /[Ww]\d+/g.exec(input)
	const south = /[Ss]\d+/g.exec(input)
	const result = {
		north: parseInt(north?.[0].substring(1) ?? '0'),
		east: parseInt(east?.[0].substring(1) ?? '0'),
		west: parseInt(west?.[0].substring(1) ?? '0'),
		south: parseInt(south?.[0].substring(1) ?? '0'),
	}
	return validate(result) ? result : null
}


// Convert Atlas XY coordinate to compass
// Y < 0  : N
// Y >= 0 : S
// X < 0  : W
// X >= 0 : E
const fromXY = ([x, y]:[number,number]): T.Compass => {
	return {
		north: y < 0 ? Math.abs(y) : 0,
		east: x >= 0 ? x + 1 : 0,
		west: x < 0 ? Math.abs(x) : 0,
		south: y >= 0 ? y + 1 : 0,
	}
}
// Compass to Atlas XY
const toXY = (compass: T.Compass) => {
	if (!validate(compass)) return [0, 0]
	const x = (compass.west && compass.west > 0) ? -compass.west : compass.east ? compass.east - 1 : 0
	const y = (compass.north && compass.north > 0) ? -compass.north : compass.south ? compass.south - 1 : 0
	return [x, y]
}


// Compares 2 coordinates
// cupports both Compass and BN
const equals = (a: T.Compass | typeof BN | null, b: T.Compass | typeof BN | null): boolean => {
	if (!a || !b) {
		return false
	}
	if (isBN(a) || isBN(b)) {
		const bnA = toBN(a)
		const bnB = toBN(b)
		if (bnA && bnB) {
			return bnA.eq(bnB)
		}
	} else if (validate(a) && validate(b)) {
		return (
			((a.north && a.north > 0 && a.north === b.north) || (a.south && a.south > 0 && a.south === b.south)) &&
			((a.east && a.east > 0 && a.east === b.east) || (a.west && a.west > 0 && a.west === b.west))
		)
	}
	console.warn(`Compass.equals() incompatible:`, a, b)
	return false
}

// must equal to Crawl.offsetCoord()
const offset = (compass: T.Compass, dir: T.Dir): T.Compass => {
	let result = { ...compass } as T.Compass
	if (dir == T.Dir.North) {
		if (result.south && result.south > 1) {
			result.south-- // --South
		} else if (result.north && result.north < T.int_max) {
			result.south = 0
			result.north++ // ++North
		}
	} else if (dir == T.Dir.East) {
		if (result.west && result.west > 1) {
			result.west-- // --West
		} else if (result.east && result.east < T.int_max) {
			result.west = 0
			result.east++ // ++East
		}
	} else if (dir == T.Dir.West) {
		if (result.east && result.east > 1) {
			result.east-- // --East
		} else if (result.west && result.west < T.int_max) {
			result.east = 0
			result.west++ // ++West
		}
	} else { //if(dir == T.Dir.South) {
		if (result.north && result.north > 1) {
			result.north-- // --North
		} else if (result.south && result.south < T.int_max) {
			result.north = 0
			result.south++ // ++South
		}
	}
	return result
}

// Remove zero coordinates from a compass
const minify = (compass: T.Compass): T.Compass => {
	let result = compass
	if (result?.north === 0) delete result.north
	if (result?.east === 0) delete result.east
	if (result?.west === 0) delete result.west
	if (result?.south === 0) delete result.south
	return result
}



//--------------------------------
// Exports
//

export {
	// validators
	validate,
	validateCoord,
	// bn
	isBN,
	bnToNumber,
	fromBN,
	toBN,
	toBigString,
	// string
	toString,
	toSlug,
	toStringLat, 	// N/S
	toStringLong,	// E/W
	fromString,
	// Atlas
	fromXY,
	toXY,
	// operations
	equals,
	offset,
	minify,
}
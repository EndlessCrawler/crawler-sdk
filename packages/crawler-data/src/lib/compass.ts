import * as T from './types'

// import { Crawl } from '@/Crawl'
// const { ethers } = require('ethers');
const BN = require('bn.js');

//
// Compass is a coordinate object
// { north, east, west, south }
//
// TODO:
// Use BN or BigInt
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
//



// const max_int = Number.MAX_SAFE_INTEGER;

// Validate a compass
const validate = (compass: T.Compass | null): boolean => {
	if (!compass) return false;
	if (compass.north && compass.south) return false;
	if (!compass.north && !compass.south) return false;
	if (compass.east && compass.west) return false;
	if (!compass.east && !compass.west) return false;
	return true;
}
const validateCoord = (bn_as_string: T.BNString | null): boolean => {
	return validate(fromBN(bn_as_string));
}

// convert compass to string: N1,E1
const _separator = ',';
const toString = (compass: T.Compass, separator: string | null = _separator): string => {
	if (!validate(compass)) return '?';
	let result = '';
	result += (compass.south ? `S${compass.south}` : `N${compass.north}`);
	if (separator) result += separator;
	result += (compass.west ? `W${compass.west}` : `E${compass.east}`);
	return result;
}

// convert compass to slug string: N1E1
const toSlug = (compass: T.Compass): string => {
	return toString(compass, null);
}

// convert compass to latitude string: N1 / S1
const toStringLat = (compass: T.Compass): string => {
	const parts = toString(compass).split(_separator);
	return parts.length == 2 ? parts[0] : '';
}

// convert compass to longitute string: E1 / W1
const toStringLong = (compass: T.Compass): string => {
	const parts = toString(compass).split(_separator);
	return parts.length == 2 ? parts[1] : '';
}


// // Covert BN coord to Compass
// // input is any Compass.toString() result
// // ex: S1E1, N12W44, S4 E4
// const fromString = (input) => {
// 	const north = /[Nn]\d+/g.exec(input);
// 	const east = /[Ee]\d+/g.exec(input);
// 	const west = /[Ww]\d+/g.exec(input);
// 	const south = /[Ss]\d+/g.exec(input);
// 	const result = {
// 		north: parseInt(north?.[0].substring(1) ?? 0),
// 		east: parseInt(east?.[0].substring(1) ?? 0),
// 		west: parseInt(west?.[0].substring(1) ?? 0),
// 		south: parseInt(south?.[0].substring(1) ?? 0),
// 	};
// 	// console.log(`Compass.fromString(${input}): `, result);
// 	return Compass.validate(result) ? result : null;
// }

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

// Remove zero coordinates from a compass
const minify = (compass: T.Compass): T.Compass => {
	let result = compass;
	if (result?.north === 0) delete result.north;
	if (result?.east === 0) delete result.east;
	if (result?.west === 0) delete result.west;
	if (result?.south === 0) delete result.south;
	return result;
}

// // Covert Compass to BN coord
// // input can be compass { north, east, ... } or coord (BN)
// const toBN = (compass_or_coord) => {
// 	if (Crawl.isBN(compass_or_coord)) {
// 		return compass_or_coord;
// 	}
// 	if (Compass.validate(compass_or_coord)) {
// 		return Crawl.makeCoord(compass_or_coord);
// 	}
// 	return null;
// }
// // Format coord as BN String
// // used as smart contract function arguments
// const toBigString = (compass_or_coord) => {
// 	let bn = Compass.toBN(compass_or_coord);
// 	return (bn ? bn.toString() : '0');
// }

// // Convert Atlas XY coordinate to compass
// // Y < 0  : N
// // Y >= 0 : S
// // X < 0  : W
// // X >= 0 : E
// const fromXY = ([x, y]) => {
// 	return {
// 		north: y < 0 ? Math.abs(y) : 0,
// 		east: x >= 0 ? x + 1 : 0,
// 		west: x < 0 ? Math.abs(x) : 0,
// 		south: y >= 0 ? y + 1 : 0,
// 	};
// }
// // Compass to Atlas XY
// const toXY = (compass) => {
// 	if (!Compass.validate(compass)) return [0, 0];
// 	const x = compass.west > 0 ? -compass.west : compass.east - 1;
// 	const y = compass.north > 0 ? -compass.north : compass.south - 1;
// 	return [x, y];
// }

// // Compares 2 coordinates
// // cupports both Compass and BN
// const equals = (a, b) => {
// 	if (!a || !b) {
// 		return false;
// 	}
// 	if (Crawl.isBN(a) || Crawl.isBN(b)) {
// 		const bnA = Crawl.toBN(a);
// 		const bnB = Crawl.toBN(b);
// 		if (bnA && bnB) {
// 			return bnA.eq(bnB);
// 		}
// 	} else if (Compass.validate(a) && Compass.validate(b)) {
// 		return (
// 			((a.north > 0 && a.north === b.north) || (a.south > 0 && a.south === b.south)) &&
// 			((a.east > 0 && a.east === b.east) || (a.west > 0 && a.west === b.west))
// 		);
// 	}
// 	console.warn(`Compass.equals() incompatible:`, a, b);
// 	return false;
// }

// // equals to Crawl.offsetCoord()
// const offset = (compass, dir) => {
// 	let result = { ...compass };
// 	if (dir == Crawl.Dir.North) {
// 		if (compass.south > 1) {
// 			result.south--; // --South
// 		} else if (compass.north < Compass.max_int) {
// 			result.south = 0;
// 			result.north++; // ++North
// 		}
// 	} else if (dir == Crawl.Dir.East) {
// 		if (compass.west > 1) {
// 			result.west--; // --West
// 		} else if (compass.east < Compass.max_int) {
// 			result.west = 0;
// 			result.east++; // ++East
// 		}
// 	} else if (dir == Crawl.Dir.West) {
// 		if (compass.east > 1) {
// 			result.east--; // --East
// 		} else if (compass.west < Compass.max_int) {
// 			result.east = 0;
// 			result.west++; // ++West
// 		}
// 	} else { //if(dir == Crawl.Dir.South) {
// 		if (compass.north > 1) {
// 			result.north--; // --North
// 		} else if (compass.south < Compass.max_int) {
// 			result.north = 0;
// 			result.south++; // ++South
// 		}
// 	}
// 	return result;
// }



//--------------------------------
// Exports
//

export {
	validate,
	validateCoord,
	toString,
	toStringLat, 	// N/S
	toStringLong,	// E/W
	toSlug,
	isBN,
	bnToNumber,
	fromBN,
	minify,
}

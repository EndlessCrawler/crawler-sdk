import {
	BigIntIsh,
} from '../types'

/**
 * @param value number, number string, hex string or bigint
 * @returns a bigint
 */
export const toBigInt = (value: BigIntIsh): bigint => BigInt(value)

/** @returns a bigint as numeric string (base-10) */
export const bigIntToString = (value: BigIntIsh): string => {
	return toBigInt(value).toString()
}

/**
 * converts a number or bigint to hex string
 * @returns result starts with '0x' and is always even, as in '0x01'
 */
export const bigIntToHex = (value: BigIntIsh): string => {
	const hex = toBigInt(value).toString(16).toLowerCase()
	return `0x${hex.length % 2 == 1 ? '0' : ''}${hex}`
}

/**
 * @param value bytes packed inside a bigint
 * @returns the bigint bytes as an Uint8Array
 */
export const bigIntToByteArray = (value: BigIntIsh): Uint8Array => {
	const hex = bigIntToHex(value).slice(2)
	const result = new Uint8Array(hex.length / 2)
	for (let i = 0; i < result.length; i++) {
		const hexByte = hex.slice(i * 2, i * 2 + 2)
		result[i] = Number.parseInt(hexByte, 16)
	}
	return result
}

/**
 * @param value bytes packed inside a bigint
 * @returns the bigint bytes as a number array
 */
export const bigIntToNumberArray = (value: BigIntIsh): number[] => Array.from(bigIntToByteArray(value))


/**
 * [1,0,1,1,0,1] > 0b1101101
 * @param value array of binary digits (0/1, true/false) max 256 or throws
 * @returns the bigint bytes as an Uint8Array
 */
export const binaryArrayToBigInt = (values: number[] | boolean[]): bigint => {
	if (values.length > 256) {
		throw new RangeError(`binaryArrayToBigInt() array length is ${values.length}, max is 256.`)
	}
	let result = '0b'
	for (let i = 0; i < values.length; i++) {
		result += (values[i] ? '1' : '0')
	}
	return BigInt(result)
}



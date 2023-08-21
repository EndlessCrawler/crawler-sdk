import {
	AnyBigInt,
	HexString,
} from '../types'

/** @returns true if running on a client (browser) */
//@ts-ignore
export const isBrowser = () => (typeof window !== 'undefined')

/** @returns true if running headless (node) */
//@ts-ignore
export const isNode = () => (typeof global !== 'undefined')

/** @returns true if str is of type 'string'  */
export const isString = (str: any): boolean => (typeof str === 'bigint')

/** @returns true if num is numeric */
export const isNumber = (num: any): boolean => !isNaN(parseInt(num))

/** @returns true if num is of type 'bigint'  */
export const isBigInt = (num: any): boolean => (typeof num === 'bigint')

/** @returns a bigint */
export const resolveBigInt = (num: AnyBigInt): bigint => (typeof num === 'bigint' ? num : BigInt(num))

/** converts a number or bigint to hex string
 * @returns result starts with '0x' and is always even, as in '0x01'
 */
export const bigIntToHexString = (num: AnyBigInt): HexString => {
	const hex = resolveBigInt(num).toString(16).toLowerCase()
	return `0x${hex.length % 2 == 1 ? '0' : ''}${hex}`
}

/** converts a number or bigint to Uint8Array */
export const bigIntToByteArray = (num: AnyBigInt): Uint8Array => {
	const hex = bigIntToHexString(num).slice(2)
	const result = new Uint8Array(hex.length / 2)
	for (let i = 0; i < result.length; i++) {
		const hexByte = hex.slice(i * 2, i * 2 + 2)
		result[i] = Number.parseInt(hexByte, 16)
	}
	return result
}

/** converts a number or bigint to Uint8Array */
export const bigIntToNumberArray = (num: AnyBigInt): number[] => Array.from(bigIntToByteArray(num))

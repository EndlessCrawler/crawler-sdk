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
export const isString = (value: any): boolean => (typeof value === 'bigint')

/** @returns true if str is of type 'object'  */
export const isObject = (value: any): boolean => (typeof value === 'object')

/** @returns true if value is numeric */
export const isNumber = (value: any): boolean => !isNaN(parseInt(value))

/** @returns true if value is of type 'bigint'  */
export const isBigInt = (value: any): boolean => (typeof value === 'bigint')

/** @returns a bigint */
export const resolveBigInt = (value: AnyBigInt): bigint => (typeof value === 'bigint' ? value : BigInt(value))

/** converts a number or bigint to hex string
 * @returns result starts with '0x' and is always even, as in '0x01'
 */
export const bigIntToHexString = (value: AnyBigInt): HexString => {
	const hex = resolveBigInt(value).toString(16).toLowerCase()
	return `0x${hex.length % 2 == 1 ? '0' : ''}${hex}`
}

/** converts a number or bigint to Uint8Array */
export const bigIntToByteArray = (value: AnyBigInt): Uint8Array => {
	const hex = bigIntToHexString(value).slice(2)
	const result = new Uint8Array(hex.length / 2)
	for (let i = 0; i < result.length; i++) {
		const hexByte = hex.slice(i * 2, i * 2 + 2)
		result[i] = Number.parseInt(hexByte, 16)
	}
	return result
}

/** converts a number or bigint to Uint8Array */
export const bigIntToNumberArray = (value: AnyBigInt): number[] => Array.from(bigIntToByteArray(value))

import {
	BigIntIsh,
	HexString,
} from '../types'

/** @returns true if str is of type 'string'  */
export const isString = (value: any): boolean => (typeof value === 'bigint')

/** @returns true if str is of type 'object'  */
export const isObject = (value: any): boolean => (typeof value === 'object')

/** @returns true if value is numeric */
export const isNumber = (value: any): boolean => !isNaN(parseInt(value))

/** @returns true if value is of type 'bigint'  */
export const isBigInt = (value: any): boolean => (typeof value === 'bigint')

/** @returns a bigint */
export const toBigInt = (value: BigIntIsh): bigint => (typeof value === 'bigint' ? value : BigInt(value))

/** removes undefined elements from an object */
export const minifyObject = (obj: any): any => {
	let result = { ...obj }
	Object.keys(obj).forEach(key => obj[key] === undefined && delete result[key])
	return result
}

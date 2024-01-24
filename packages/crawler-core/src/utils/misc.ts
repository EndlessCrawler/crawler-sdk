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

/** removes undefined elements from an object */
export const minifyObject = (obj: any): any => {
	let result = { ...obj }
	Object.keys(obj).forEach(key => obj[key] === undefined && delete result[key])
	return result
}



/** @returns -1 if the value is negative, 0 if zero, 1 if positive */
export const sign = (v: number): number => (v > 0 ? 1 : v < 0 ? -1 : 0)

/** @returns the absolute value of a number */
export const abs = (v: number): number => (v < 0 ? -v : v)

/** @returns the minimum value of two numbers */
export const min = <T extends bigint | number>(a: T, b: T): T => (a < b ? a : b)

/** @returns the maximum value of two numbers */
export const max = <T extends bigint | number>(a: T, b: T): T => (a > b ? a : b)

/** @returns a number clamped between min and max */
export const clamp = <T extends bigint | number>(v: T, min: T, max: T): T => (v < min ? min : v > max ? max : v)

/** @returns a number clamped between 0 and 1 */
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/** @returns lerp between min ans max */
export const lerp = (min: number, max: number, f: number): number => (min + (max - min) * f)

/** @returns a number mapped from one range to another */
export const map = (v: number, inMin: number, inMax: number, outMin: number, outMax: number): number => (outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin)))

/** @returns the float modulus */
export const modf = (v: number, m: number): number => (v - m * Math.floor(v / m))

/** @returns XXXXXXX */
// export const fmod = (a: number, b: number): number => Number((a - (Math.floor(a / b) * b)).toPrecision(8)) // TODO: TEST THIS!!!

export const DegreesPerRadians = (180 / Math.PI);

/** @returns a radian angle in degree */
export const toDegrees = (r: number) => (r * DegreesPerRadians)

/** @returns a degree angle in radian */
export const toRadians = (d: number) => (d / DegreesPerRadians)

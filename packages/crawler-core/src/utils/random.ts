/**
 * @param maxNonInclusive the max positive integer, non inclusive
 * @returns a random positive integer number
 */
export const makeRandomInt = (maxNonInclusive: number): number => (Math.floor(Math.random() * maxNonInclusive))

/**
 * @param array any array, or string
 * @returns a random element from the array or string
 */
export const randomArrayElement = (array: any[] | string): any | string | null => (array.length > 0 ? array[makeRandomInt(array.length)] : null)

/**
 * @param bytes number of bytes of the hash
 * @param prefix '0x' by default, use null for none
 * @returns a random hex string
 */
export const makeRandomHash = (bytes = 16, prefix = '0x') => {
	const hexChars = '0123456789abcdef'
	let result = prefix ?? ''
	for (let i = 0; i < bytes * 2; ++i) {
		result += hexChars[makeRandomInt(hexChars.length)]
	}
	return result
}

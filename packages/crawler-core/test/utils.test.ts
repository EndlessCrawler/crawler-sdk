import 'jest-expect-message'
import {
	toBigInt,
	bigIntToHex,
	bigIntToByteArray,
	bigIntToNumberArray,
	EndlessCrawler
} from '../src'

const CoordMax = EndlessCrawler.CoordMax

describe('* utils', () => {

	it('toBigInt()', () => {
		expect(toBigInt(0), 'toBigInt(): bad input').toBe(0n)
		expect(toBigInt(0n), 'toBigInt(): bad input').toBe(0n)
		expect(toBigInt('0'), 'toBigInt(): bad input').toBe(0n)
		expect(toBigInt('0x0'), 'toBigInt(): bad input').toBe(0n)
		expect(toBigInt('0x00'), 'toBigInt(): bad input').toBe(0n)

		expect(toBigInt(1), 'toBigInt(): bad input').toBe(1n)
		expect(toBigInt(1n), 'toBigInt(): bad input').toBe(1n)
		expect(toBigInt('1'), 'toBigInt(): bad input').toBe(1n)
		expect(toBigInt('0x1'), 'toBigInt(): bad input').toBe(1n)
		expect(toBigInt('0x01'), 'toBigInt(): bad input').toBe(1n)

		expect(toBigInt('0xff'), 'toBigInt(): bad input').toBe(255n)
		expect(toBigInt('0x100'), 'toBigInt(): bad input').toBe(256n)
		expect(toBigInt('0x0100'), 'toBigInt(): bad input').toBe(256n)
		expect(toBigInt('0xffffffffffffffff'), 'toBigInt(): bad input').toBe(CoordMax)
	})

	it('bigIntToHex()', () => {
		expect(bigIntToHex(0), 'bigIntToHex(): bad input').toBe('0x00')
		expect(bigIntToHex(0n), 'bigIntToHex(): bad input').toBe('0x00')
		expect(bigIntToHex('0'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(bigIntToHex('0x0'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(bigIntToHex('0x00'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(bigIntToHex('0x000'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(bigIntToHex('0x0000'), 'bigIntToHex(): bad input').toBe('0x00')

		expect(bigIntToHex(1), 'bigIntToHex(): bad input').toBe('0x01')
		expect(bigIntToHex(1n), 'bigIntToHex(): bad input').toBe('0x01')
		expect(bigIntToHex('1'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(bigIntToHex('0x1'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(bigIntToHex('0x01'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(bigIntToHex('0x001'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(bigIntToHex('0x0001'), 'bigIntToHex(): bad input').toBe('0x01')

		expect(bigIntToHex(255n), 'bigIntToHex(): bad input').toBe('0xff')
		expect(bigIntToHex(256n), 'bigIntToHex(): bad input').toBe('0x0100')
		expect(bigIntToHex(CoordMax), 'bigIntToHex(): bad input').toBe('0xffffffffffffffff')
	})

	it('bigIntToByteArray()', () => {
		expect(bigIntToByteArray(0), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(bigIntToByteArray(0n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(bigIntToByteArray('0'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(bigIntToByteArray('0x0'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(bigIntToByteArray('0x00'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))

		expect(bigIntToByteArray(1), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray(1n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray('1'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray('0x1'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray('0x01'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray('0x001'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray('0x0001'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(bigIntToByteArray('0x010203'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1, 2, 3]))
		expect(bigIntToByteArray('0x010201'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1, 2, 1]))
		expect(bigIntToNumberArray('0x010201'), 'bigIntToByteArray(): bad input').toEqual([1, 2, 1])

		expect(bigIntToByteArray(255n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([255]))
		expect(bigIntToByteArray(256n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1, 0]))
		expect(bigIntToByteArray(CoordMax), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]))

	})

})

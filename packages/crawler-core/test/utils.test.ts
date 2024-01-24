import 'jest-expect-message'
import {
	Utils,
	EndlessCrawler,
} from '../src'

const CoordMax = EndlessCrawler.CoordMax

describe('* utils', () => {

	it('toBigInt()', () => {
		expect(Utils.toBigInt(0), 'toBigInt(): bad input').toBe(0n)
		expect(Utils.toBigInt(0n), 'toBigInt(): bad input').toBe(0n)
		expect(Utils.toBigInt('0'), 'toBigInt(): bad input').toBe(0n)
		expect(Utils.toBigInt('0x0'), 'toBigInt(): bad input').toBe(0n)
		expect(Utils.toBigInt('0x00'), 'toBigInt(): bad input').toBe(0n)

		expect(Utils.toBigInt(1), 'toBigInt(): bad input').toBe(1n)
		expect(Utils.toBigInt(1n), 'toBigInt(): bad input').toBe(1n)
		expect(Utils.toBigInt('1'), 'toBigInt(): bad input').toBe(1n)
		expect(Utils.toBigInt('0x1'), 'toBigInt(): bad input').toBe(1n)
		expect(Utils.toBigInt('0x01'), 'toBigInt(): bad input').toBe(1n)

		expect(Utils.toBigInt('0xff'), 'toBigInt(): bad input').toBe(255n)
		expect(Utils.toBigInt('0x100'), 'toBigInt(): bad input').toBe(256n)
		expect(Utils.toBigInt('0x0100'), 'toBigInt(): bad input').toBe(256n)
		expect(Utils.toBigInt('0xffffffffffffffff'), 'toBigInt(): bad input').toBe(CoordMax)
	})

	it('bigIntToHex()', () => {
		expect(Utils.bigIntToHex(0), 'bigIntToHex(): bad input').toBe('0x00')
		expect(Utils.bigIntToHex(0n), 'bigIntToHex(): bad input').toBe('0x00')
		expect(Utils.bigIntToHex('0'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(Utils.bigIntToHex('0x0'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(Utils.bigIntToHex('0x00'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(Utils.bigIntToHex('0x000'), 'bigIntToHex(): bad input').toBe('0x00')
		expect(Utils.bigIntToHex('0x0000'), 'bigIntToHex(): bad input').toBe('0x00')

		expect(Utils.bigIntToHex(1), 'bigIntToHex(): bad input').toBe('0x01')
		expect(Utils.bigIntToHex(1n), 'bigIntToHex(): bad input').toBe('0x01')
		expect(Utils.bigIntToHex('1'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(Utils.bigIntToHex('0x1'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(Utils.bigIntToHex('0x01'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(Utils.bigIntToHex('0x001'), 'bigIntToHex(): bad input').toBe('0x01')
		expect(Utils.bigIntToHex('0x0001'), 'bigIntToHex(): bad input').toBe('0x01')

		expect(Utils.bigIntToHex(255n), 'bigIntToHex(): bad input').toBe('0xff')
		expect(Utils.bigIntToHex(256n), 'bigIntToHex(): bad input').toBe('0x0100')
		expect(Utils.bigIntToHex(CoordMax), 'bigIntToHex(): bad input').toBe('0xffffffffffffffff')
	})

	it('bigIntToByteArray()', () => {
		expect(Utils.bigIntToByteArray(0), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(Utils.bigIntToByteArray(0n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(Utils.bigIntToByteArray('0'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(Utils.bigIntToByteArray('0x0'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(Utils.bigIntToByteArray('0x00'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([0]))

		expect(Utils.bigIntToByteArray(1), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray(1n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray('1'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray('0x1'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray('0x01'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray('0x001'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray('0x0001'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(Utils.bigIntToByteArray('0x010203'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1, 2, 3]))
		expect(Utils.bigIntToByteArray('0x010201'), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1, 2, 1]))
		expect(Utils.bigIntToNumberArray('0x010201'), 'bigIntToByteArray(): bad input').toEqual([1, 2, 1])

		expect(Utils.bigIntToByteArray(255n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([255]))
		expect(Utils.bigIntToByteArray(256n), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([1, 0]))
		expect(Utils.bigIntToByteArray(CoordMax), 'bigIntToByteArray(): bad input').toEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]))

	})

})

import 'jest-expect-message'
import {
	resolveBigInt,
	bigIntToHexString,
	bigIntToByteArray,
	bigIntToNumberArray,
	EndlessCrawler
} from '../src'

const CoordMax = EndlessCrawler.CoordMax

describe('* utils', () => {

	it('resolveBigInt()', () => {
		expect(resolveBigInt(0), 'resolveBigInt(): bad input').toBe(0n)
		expect(resolveBigInt(0n), 'resolveBigInt(): bad input').toBe(0n)
		expect(resolveBigInt('0'), 'resolveBigInt(): bad input').toBe(0n)
		expect(resolveBigInt('0x0'), 'resolveBigInt(): bad input').toBe(0n)
		expect(resolveBigInt('0x00'), 'resolveBigInt(): bad input').toBe(0n)

		expect(resolveBigInt(1), 'resolveBigInt(): bad input').toBe(1n)
		expect(resolveBigInt(1n), 'resolveBigInt(): bad input').toBe(1n)
		expect(resolveBigInt('1'), 'resolveBigInt(): bad input').toBe(1n)
		expect(resolveBigInt('0x1'), 'resolveBigInt(): bad input').toBe(1n)
		expect(resolveBigInt('0x01'), 'resolveBigInt(): bad input').toBe(1n)

		expect(resolveBigInt('0xff'), 'resolveBigInt(): bad input').toBe(255n)
		expect(resolveBigInt('0x100'), 'resolveBigInt(): bad input').toBe(256n)
		expect(resolveBigInt('0x0100'), 'resolveBigInt(): bad input').toBe(256n)
		expect(resolveBigInt('0xffffffffffffffff'), 'resolveBigInt(): bad input').toBe(CoordMax)
	})

	it('bigIntToHexString()', () => {
		expect(bigIntToHexString(0), 'bigIntToHexString(): bad input').toBe('0x00')
		expect(bigIntToHexString(0n), 'bigIntToHexString(): bad input').toBe('0x00')
		expect(bigIntToHexString('0'), 'bigIntToHexString(): bad input').toBe('0x00')
		expect(bigIntToHexString('0x0'), 'bigIntToHexString(): bad input').toBe('0x00')
		expect(bigIntToHexString('0x00'), 'bigIntToHexString(): bad input').toBe('0x00')
		expect(bigIntToHexString('0x000'), 'bigIntToHexString(): bad input').toBe('0x00')
		expect(bigIntToHexString('0x0000'), 'bigIntToHexString(): bad input').toBe('0x00')

		expect(bigIntToHexString(1), 'bigIntToHexString(): bad input').toBe('0x01')
		expect(bigIntToHexString(1n), 'bigIntToHexString(): bad input').toBe('0x01')
		expect(bigIntToHexString('1'), 'bigIntToHexString(): bad input').toBe('0x01')
		expect(bigIntToHexString('0x1'), 'bigIntToHexString(): bad input').toBe('0x01')
		expect(bigIntToHexString('0x01'), 'bigIntToHexString(): bad input').toBe('0x01')
		expect(bigIntToHexString('0x001'), 'bigIntToHexString(): bad input').toBe('0x01')
		expect(bigIntToHexString('0x0001'), 'bigIntToHexString(): bad input').toBe('0x01')

		expect(bigIntToHexString(255n), 'bigIntToHexString(): bad input').toBe('0xff')
		expect(bigIntToHexString(256n), 'bigIntToHexString(): bad input').toBe('0x0100')
		expect(bigIntToHexString(CoordMax), 'bigIntToHexString(): bad input').toBe('0xffffffffffffffff')
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

import 'jest-expect-message'
import {
	resolveBigInt,
	toHexString,
	toByteArray,
} from '../src/lib/utils'
import {
	CompassDirMax,
} from '../src/lib/crawl'

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
		expect(resolveBigInt('0xffffffffffffffff'), 'resolveBigInt(): bad input').toBe(CompassDirMax)
	})

	it('toHexString()', () => {
		expect(toHexString(0), 'toHexString(): bad input').toBe('0x00')
		expect(toHexString(0n), 'toHexString(): bad input').toBe('0x00')
		expect(toHexString('0'), 'toHexString(): bad input').toBe('0x00')
		expect(toHexString('0x0'), 'toHexString(): bad input').toBe('0x00')
		expect(toHexString('0x00'), 'toHexString(): bad input').toBe('0x00')
		expect(toHexString('0x000'), 'toHexString(): bad input').toBe('0x00')
		expect(toHexString('0x0000'), 'toHexString(): bad input').toBe('0x00')

		expect(toHexString(1), 'toHexString(): bad input').toBe('0x01')
		expect(toHexString(1n), 'toHexString(): bad input').toBe('0x01')
		expect(toHexString('1'), 'toHexString(): bad input').toBe('0x01')
		expect(toHexString('0x1'), 'toHexString(): bad input').toBe('0x01')
		expect(toHexString('0x01'), 'toHexString(): bad input').toBe('0x01')
		expect(toHexString('0x001'), 'toHexString(): bad input').toBe('0x01')
		expect(toHexString('0x0001'), 'toHexString(): bad input').toBe('0x01')

		expect(toHexString(255n), 'toHexString(): bad input').toBe('0xff')
		expect(toHexString(256n), 'toHexString(): bad input').toBe('0x0100')
		expect(toHexString(CompassDirMax), 'toHexString(): bad input').toBe('0xffffffffffffffff')
	})

	it('toByteArray()', () => {
		expect(toByteArray(0), 'toByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(toByteArray(0n), 'toByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(toByteArray('0'), 'toByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(toByteArray('0x0'), 'toByteArray(): bad input').toEqual(new Uint8Array([0]))
		expect(toByteArray('0x00'), 'toByteArray(): bad input').toEqual(new Uint8Array([0]))

		expect(toByteArray(1), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray(1n), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray('1'), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray('0x1'), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray('0x01'), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray('0x001'), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray('0x0001'), 'toByteArray(): bad input').toEqual(new Uint8Array([1]))
		expect(toByteArray('0x010203'), 'toByteArray(): bad input').toEqual(new Uint8Array([1, 2, 3]))
		expect(toByteArray('0x010201'), 'toByteArray(): bad input').toEqual(new Uint8Array([1, 2, 1]))

		expect(toByteArray(255n), 'toByteArray(): bad input').toEqual(new Uint8Array([255]))
		expect(toByteArray(256n), 'toByteArray(): bad input').toEqual(new Uint8Array([1, 0]))
		expect(toByteArray(CompassDirMax), 'toByteArray(): bad input').toEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]))
	})

})

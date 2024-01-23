import {
	Bitmap, binaryArrayToBigInt
} from '../src'

//@ts-ignore
BigInt.prototype.toJSON = function () { return (this <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(this) : this.toString()) }

const mixedmap = BigInt('0xce734001a002500188024401820241018082404180224011800a40058002aa55')
const mixedmap_int = [
	1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1,
	0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
	0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
	0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
	0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
	0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
	0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0,
	0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
	1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
	1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1,
]

describe('Bitmap', () => {

	it('premises', () => {
		expect(BigInt('0b1')).toBe(1n)
		expect(BigInt('0b01')).toBe(1n)
		expect(BigInt('0b11')).toBe(3n)
		expect(BigInt('0b11111111')).toBe(255n)
		expect(mixedmap_int.length).toBe(256)
	})

	it('binaryArrayToBigInt(number[])', () => {
		const big1 = binaryArrayToBigInt(mixedmap_int)
		expect(big1.toString(16)).toBe(mixedmap.toString(16))
	})

	it('flipDoorPosition()', () => {
		const _doorW = 96
		const _doorE = 111
		const _doorN = 9
		const _doorS = 249
		const _doorU = 168
		expect(Bitmap.flipDoorPosition(_doorW)).toBe(_doorE)
		expect(Bitmap.flipDoorPosition(_doorE)).toBe(_doorW)
		expect(Bitmap.flipDoorPosition(_doorN)).toBe(_doorS)
		expect(Bitmap.flipDoorPosition(_doorS)).toBe(_doorN)
		expect(Bitmap.flipDoorPosition(_doorU)).toBe(_doorU)
	})

	it('tileToXy(), xyToTile()', () => {
    const _test = (tile: Bitmap.Tile, x: number, y: number) => {
			expect(Bitmap.tileToXy(tile)).toEqual(expect.objectContaining({ x, y }))
			expect(Bitmap.xyToTile({ x, y })).toEqual(tile)
		}
		_test(0, 0, 0);
		_test(1, 1, 0);
		_test(15, 15, 0);
		_test(16, 0, 1);
		_test(17, 1, 1);
		_test(32, 0, 2);
		_test(255, 15, 15);
	})

	it('flipDoorPositionXY()', () => {
	})
})

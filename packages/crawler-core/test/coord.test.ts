import 'jest-expect-message'
import {
	Dir,
	CompassDirMax,
	offsetCoord,
	validateCoord,
} from '../src'

type NumOrBig = number | bigint

const _makeCoord = (north: NumOrBig, east: NumOrBig, west: NumOrBig, south: NumOrBig): bigint => {
	let result = 0n
	if (north > 0) {
		expect(south, 'makeCoord(): bad North/South').toBe(0)
		result += (BigInt(north) << 192n)
	} else if (south > 0) {
		result += BigInt(south)
	} else {
		fail('makeCoord(): need North or South')
	}
	// West or East need to be positive, but not both
	if (east > 0) {
		expect(west, 'makeCoord(): bad West/East').toBe(0)
		result += (BigInt(east) << 128n)
	} else if (west > 0) {
		result += (BigInt(west) << 64n)
	} else {
		fail('makeCoord(): need West or East')
	}
	return result
}

const _testOffset = (coord: bigint, dir: Dir, north: NumOrBig, east: NumOrBig, west: NumOrBig, south: NumOrBig): bigint => {
	const result = offsetCoord(coord, dir)
	expect(validateCoord(result)).toBe(true)
	expect(result).toBe(_makeCoord(north, east, west, south))
	return result
}

describe('* coord', () => {

	// TODO: validate, convert to Compass, slug

	it('offsetCoord()', () => {
		let coord = 0n

		// Offset North
		coord = _makeCoord(0, 1, 0, 2)
		coord = _testOffset(coord, Dir.North, 0, 1, 0, 1)
		coord = _testOffset(coord, Dir.North, 1, 1, 0, 0)
		coord = _testOffset(coord, Dir.North, 2, 1, 0, 0)
		// limit, returns same
		coord = _makeCoord(CompassDirMax, 1, 0, 0)
		coord = _testOffset(coord, Dir.North, CompassDirMax, 1, 0, 0)

		// Offset South
		coord = _makeCoord(2, 1, 0, 0)
		coord = _testOffset(coord, Dir.South, 1, 1, 0, 0)
		coord = _testOffset(coord, Dir.South, 0, 1, 0, 1)
		coord = _testOffset(coord, Dir.South, 0, 1, 0, 2)
		// limit, returns same
		coord = _makeCoord(0, 1, 0, CompassDirMax)
		coord = _testOffset(coord, Dir.South, 0, 1, 0, CompassDirMax)

		// Offset East
		coord = _makeCoord(1, 0, 2, 0)
		coord = _testOffset(coord, Dir.East, 1, 0, 1, 0)
		coord = _testOffset(coord, Dir.East, 1, 1, 0, 0)
		coord = _testOffset(coord, Dir.East, 1, 2, 0, 0)
		// limit, returns same
		coord = _makeCoord(1, CompassDirMax, 0, 0)
		coord = _testOffset(coord, Dir.East, 1, CompassDirMax, 0, 0)

		// Offset West
		coord = _makeCoord(1, 2, 0, 0)
		coord = _testOffset(coord, Dir.West, 1, 1, 0, 0)
		coord = _testOffset(coord, Dir.West, 1, 0, 1, 0)
		coord = _testOffset(coord, Dir.West, 1, 0, 2, 0)
		// limit, returns same
		coord = _makeCoord(1, 0, CompassDirMax, 0)
		coord = _testOffset(coord, Dir.West, 1, 0, CompassDirMax, 0)

	})

})

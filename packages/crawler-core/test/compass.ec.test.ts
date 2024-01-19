import 'jest-expect-message'
import {
	createClient,
	ModuleId,
	EndlessCrawler,
	ModuleInterface,
	Dir,
} from '../src'

//@ts-ignore
BigInt.prototype.toJSON = function () { return (this <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(this) : this.toString()) }

const CoordMax = EndlessCrawler.CoordMax
type Compass = EndlessCrawler.Compass

describe('compass.ec', () => {
	let client: ModuleInterface

	beforeAll(() => {
		client = createClient(ModuleId.EndlessCrawler) as ModuleInterface
	})

	it('validateCompass()', () => {
		// -- positives
		expect(client.validateCompass({ north: 11, east: 22 })).toBe(true)
		expect(client.validateCompass({ north: 11, west: 33 })).toBe(true)
		expect(client.validateCompass({ south: 44, east: 22 })).toBe(true)
		expect(client.validateCompass({ south: 44, west: 33 })).toBe(true)
		// zeroes are ignored
		expect(client.validateCompass({ north: 11, east: 22, south: 0, west: 0 })).toBe(true)
		expect(client.validateCompass({ north: 11, east: 22, south: 0 })).toBe(true)
		expect(client.validateCompass({ north: 11, east: 22, west: 0 })).toBe(true)
		expect(client.validateCompass({ north: 11, west: 33, south: 0, east: 0 })).toBe(true)
		expect(client.validateCompass({ north: 11, west: 33, south: 0 })).toBe(true)
		expect(client.validateCompass({ north: 11, west: 33, east: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, east: 22, north: 0, west: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, east: 22, north: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, east: 22, west: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, west: 33, north: 0, east: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, west: 33, north: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, west: 33, east: 0 })).toBe(true)
		expect(client.validateCompass({ south: 44, west: 33, east: null })).toBe(true)
		expect(client.validateCompass({ south: 44, west: 33, east: undefined })).toBe(true)
		// check not overflowing
		expect(client.validateCompass({ north: CoordMax, east: CoordMax })).toBe(true)
		expect(client.validateCompass({ north: CoordMax, west: CoordMax })).toBe(true)
		expect(client.validateCompass({ south: CoordMax, east: CoordMax })).toBe(true)
		expect(client.validateCompass({ south: CoordMax, west: CoordMax })).toBe(true)
		// -- negatives
		// incomplete
		expect(client.validateCompass({} as any)).toBe(false)
		expect(client.validateCompass({ north: 11 } as any)).toBe(false)
		expect(client.validateCompass({ east: 22 } as any)).toBe(false)
		expect(client.validateCompass({ west: 33 } as any)).toBe(false)
		expect(client.validateCompass({ south: 44 } as any)).toBe(false)
		expect(client.validateCompass({ north: 0, east: 22 })).toBe(false)
		expect(client.validateCompass({ north: 11, east: 0 })).toBe(false)
		expect(client.validateCompass({ north: 0, west: 33 })).toBe(false)
		expect(client.validateCompass({ north: 11, west: 0 })).toBe(false)
		expect(client.validateCompass({ south: 0, east: 22 })).toBe(false)
		expect(client.validateCompass({ south: 44, east: 0 })).toBe(false)
		expect(client.validateCompass({ south: 0, west: 33 })).toBe(false)
		expect(client.validateCompass({ south: 44, west: 0 })).toBe(false)
		expect(client.validateCompass({ north: 0, south: 0, east: 22 })).toBe(false)
		expect(client.validateCompass({ north: 0, south: 0, west: 33 })).toBe(false)
		expect(client.validateCompass({ east: 0, west: 0, north: 11 })).toBe(false)
		expect(client.validateCompass({ east: 0, west: 0, south: 44 })).toBe(false)
		// invalids
		expect(client.validateCompass({ north: 11, south: 44 } as any)).toBe(false)
		expect(client.validateCompass({ east: 22, west: 33 } as any)).toBe(false)
		expect(client.validateCompass({ north: 11, south: 44, east: 22 } as any)).toBe(false)
		expect(client.validateCompass({ north: 11, south: 44, west: 33 } as any)).toBe(false)
		expect(client.validateCompass({ east: 22, west: 33, north: 11 } as any)).toBe(false)
		expect(client.validateCompass({ east: 22, west: 33, south: 44 } as any)).toBe(false)
	})

	it('minifyCompass()', () => {
		expect(Object.keys(client.minifyCompass({ north: 11, east: 22, south: 0, west: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['south', 'west']))
		expect(Object.keys(client.minifyCompass({ north: 11, east: 22, south: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['south', 'west']))
		expect(Object.keys(client.minifyCompass({ north: 11, east: 22, west: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['south', 'west']))
		expect(Object.keys(client.minifyCompass({ north: 11, west: 33, south: 0, east: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['south', 'east']))
		expect(Object.keys(client.minifyCompass({ north: 11, west: 33, south: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['south', 'east']))
		expect(Object.keys(client.minifyCompass({ north: 11, west: 33, east: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['south', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, east: 22, north: 0, west: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'west']))
		expect(Object.keys(client.minifyCompass({ south: 44, east: 22, north: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'west']))
		expect(Object.keys(client.minifyCompass({ south: 44, east: 22, west: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'west']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, north: 0, east: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, north: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, east: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, north: null, east: null }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, north: undefined, east: undefined }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, east: null }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		expect(Object.keys(client.minifyCompass({ south: 44, west: 33, east: undefined }) as Compass)).toEqual(expect.not.arrayContaining(['north', 'east']))
		// yonder too
		expect(Object.keys(client.minifyCompass({ north: 11, east: 22, yonder: 0 }) as Compass)).toEqual(expect.not.arrayContaining(['yonder']))
		expect(Object.keys(client.minifyCompass({ north: 11, east: 22, yonder: 33 }) as Compass)).toEqual(expect.arrayContaining(['yonder']))
	})

	it('compassEquals()', () => {
		// positives
		expect(client.compassEquals({ north: 11, east: 22 }, { north: 11, east: 22 })).toBe(true)
		expect(client.compassEquals({ north: 11, east: 22 }, { east: 22, north: 11 })).toBe(true)
		expect(client.compassEquals({ north: 11, east: 22 }, { north: 11, east: 22, south: 0, west: 0 })).toBe(true)
		expect(client.compassEquals({ north: 11, east: 22 }, { south: 0, west: 0, north: 11, east: 22 })).toBe(true)
		// negatives
		expect(client.compassEquals({ north: 11, east: 22 }, { north: 11, west: 22 })).toBe(false)
		expect(client.compassEquals({ north: 11, east: 22 }, { north: 11, east: 99 })).toBe(false)
		// invalids
		expect(client.compassEquals({ north: 11, south: 44 }, { south: 44, north: 11 })).toBe(false)
	})

	it('offsetCoord(), offsetCompass(), compassToCoord(), coordToCompass()', () => {
		const _validateCompass = (compass: Compass, north: bigint, east: bigint, west: bigint, south: bigint) => {
			expect(compass.north).toBe(north)
			expect(compass.east).toBe(east)
			expect(compass.west).toBe(west)
			expect(compass.south).toBe(south)
		}
		const _validateCoord = (coord: bigint, north: bigint, east: bigint, west: bigint, south: bigint) => {
			_validateCompass(client.coordToCompass(coord) as Compass, north, east, west, south)
		}
		const _makeCoord = (north: bigint, east: bigint, west: bigint, south: bigint) => {
			return client.compassToCoord({ north, east, west, south })
		}
		const _testOffset = (coord: bigint, dir: Dir, north: bigint, east: bigint, west: bigint, south: bigint): bigint => {
			// validate offsetCoord()
			const offCoord = client.offsetCoord(coord, dir);
			_validateCoord(offCoord, north, east, west, south);
			// validate offsetCompass()
			const compass = client.coordToCompass(coord) as Compass
			const offCompass = client.offsetCompass(compass, dir) as Compass;
			_validateCompass(offCompass, north, east, west, south);
			return offCoord;
		}

		// Offset North
		let _coord
		{
			_coord = _makeCoord(0n, 1n, 0n, 2n);
			_validateCoord(_coord, 0n, 1n, 0n, 2n);
			_coord = _testOffset(_coord, Dir.North, 0n, 1n, 0n, 1n);
			_coord = _testOffset(_coord, Dir.North, 1n, 1n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.North, 2n, 1n, 0n, 0n);
			// limit: no overflow, returns same
			_coord = _makeCoord(CoordMax, 1n, 0n, 0n);
			_validateCoord(_coord, CoordMax, 1n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.North, CoordMax, 1n, 0n, 0n);
		}
		// Offset South
		{
			_coord = _makeCoord(2n, 1n, 0n, 0n);
			_validateCoord(_coord, 2n, 1n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.South, 1n, 1n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.South, 0n, 1n, 0n, 1n);
			_coord = _testOffset(_coord, Dir.South, 0n, 1n, 0n, 2n);
			// limit: no overflow, returns same
			_coord = _makeCoord(0n, 1n, 0n, CoordMax);
			_validateCoord(_coord, 0n, 1n, 0n, CoordMax);
			_coord = _testOffset(_coord, Dir.South, 0n, 1n, 0n, CoordMax);
		}
		// Offset East
		{
			_coord = _makeCoord(1n, 0n, 2n, 0n);
			_validateCoord(_coord, 1n, 0n, 2n, 0n);
			_coord = _testOffset(_coord, Dir.East, 1n, 0n, 1n, 0n);
			_coord = _testOffset(_coord, Dir.East, 1n, 1n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.East, 1n, 2n, 0n, 0n);
			// limit: no overflow, returns same
			_coord = _makeCoord(1n, CoordMax, 0n, 0n);
			_validateCoord(_coord, 1n, CoordMax, 0n, 0n);
			_coord = _testOffset(_coord, Dir.East, 1n, CoordMax, 0n, 0n);
		}
		// Offset West
		{
			_coord = _makeCoord(1n, 2n, 0n, 0n);
			_validateCoord(_coord, 1n, 2n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.West, 1n, 1n, 0n, 0n);
			_coord = _testOffset(_coord, Dir.West, 1n, 0n, 1n, 0n);
			_coord = _testOffset(_coord, Dir.West, 1n, 0n, 2n, 0n);
			// limit: no overflow, returns same
			_coord = _makeCoord(1n, 0n, CoordMax, 0n);
			_validateCoord(_coord, 1n, 0n, CoordMax, 0n);
			_coord = _testOffset(_coord, Dir.West, 1n, 0n, CoordMax, 0n);
		}
		// offset should keep yonder
		const yonderCompass = client.offsetCompass({ south: 1n, east: 2n, yonder: 3n }, Dir.East) as Compass;
		expect(yonderCompass.yonder).toBe(3n)
	})

})

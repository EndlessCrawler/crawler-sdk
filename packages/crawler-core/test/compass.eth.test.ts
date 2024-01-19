import {
	createClient,
	ModuleId,
	EndlessCrawler,
	ModuleInterface,
	Dir,
} from '../src'

const CoordMax = Number(EndlessCrawler.CoordMax)
type Compass = EndlessCrawler.Compass

describe('EndlessCrawler.Compass', () => {
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


	it.skip('offsetCoord()', () => {
		const _validateCoord = (coord: bigint, n: number, e: number, w: number, s: number) => {
			// validate directions
			const { north, east, west, south } = client.coordToCompass(coord) as Compass
			expect(north).toBe(n)
			expect(east).toBe(e)
			expect(west).toBe(w)
			expect(south).toBe(s)
		}
		const _makeCoord = (north: number, east: number, west: number, south: number) => {
			return client.compassToCoord({ north, east, west, south })
		}
		const _testOffset = (coord: bigint, dir: Dir, n: number, e: number, w: number, s: number): bigint => {
			const newCoord = client.offsetCoord(coord, dir);
			_validateCoord(newCoord, n, e, w, s);
			return newCoord;
		}

		// Offset North
		let _coord
		{
			_coord = _makeCoord(0, 1, 0, 2);
			_validateCoord(_coord, 0, 1, 0, 2);
			_coord = _testOffset(_coord, Dir.North, 0, 1, 0, 1);
			_coord = _testOffset(_coord, Dir.North, 1, 1, 0, 0);
			_coord = _testOffset(_coord, Dir.North, 2, 1, 0, 0);
			// limit, returns same
			_coord = _makeCoord(CoordMax, 1, 0, 0);
			_validateCoord(_coord, CoordMax, 1, 0, 0);
			_coord = _testOffset(_coord, Dir.North, CoordMax, 1, 0, 0);
		}
		// Offset South
		{
			_coord = _makeCoord(2, 1, 0, 0);
			_validateCoord(_coord, 2, 1, 0, 0);
			_coord = _testOffset(_coord, Dir.South, 1, 1, 0, 0);
			_coord = _testOffset(_coord, Dir.South, 0, 1, 0, 1);
			_coord = _testOffset(_coord, Dir.South, 0, 1, 0, 2);
			// limit, returns same
			_coord = _makeCoord(0, 1, 0, CoordMax);
			_validateCoord(_coord, 0, 1, 0, CoordMax);
			_coord = _testOffset(_coord, Dir.South, 0, 1, 0, CoordMax);
		}
		// Offset East
		{
			_coord = _makeCoord(1, 0, 2, 0);
			_validateCoord(_coord, 1, 0, 2, 0);
			_coord = _testOffset(_coord, Dir.East, 1, 0, 1, 0);
			_coord = _testOffset(_coord, Dir.East, 1, 1, 0, 0);
			_coord = _testOffset(_coord, Dir.East, 1, 2, 0, 0);
			// limit, returns same
			_coord = _makeCoord(1, CoordMax, 0, 0);
			_validateCoord(_coord, 1, CoordMax, 0, 0);
			_coord = _testOffset(_coord, Dir.East, 1, CoordMax, 0, 0);
		}
		// Offset West
		{
			_coord = _makeCoord(1, 2, 0, 0);
			_validateCoord(_coord, 1, 2, 0, 0);
			_coord = _testOffset(_coord, Dir.West, 1, 1, 0, 0);
			_coord = _testOffset(_coord, Dir.West, 1, 0, 1, 0);
			_coord = _testOffset(_coord, Dir.West, 1, 0, 2, 0);
			// limit, returns same
			_coord = _makeCoord(1, 0, CoordMax, 0);
			_validateCoord(_coord, 1, 0, CoordMax, 0);
			_coord = _testOffset(_coord, Dir.West, 1, 0, CoordMax, 0);
		}



	})






})

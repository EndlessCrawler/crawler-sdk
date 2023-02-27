import * as Compass from '../src/lib/compass'

describe('Compass', () => {
	it('validate(): true', () => {
		expect(Compass.validate({ north: 1, east: 1 })).toBe(true)
		expect(Compass.validate({ north: 1, west: 1 })).toBe(true)
		expect(Compass.validate({ south: 1, east: 1 })).toBe(true)
		expect(Compass.validate({ south: 1, west: 1 })).toBe(true)
		// zeroes are ignored
		expect(Compass.validate({ north: 1, east: 1, south: 0, west: 0 })).toBe(true)
		expect(Compass.validate({ north: 1, west: 1, south: 0, east: 0 })).toBe(true)
		expect(Compass.validate({ south: 1, east: 1, north: 0, west: 0 })).toBe(true)
		expect(Compass.validate({ south: 1, west: 1, north: 0, east: 0 })).toBe(true)
	})
	it('validate(): false', () => {
		expect(Compass.validate({ north: 1 })).toBe(false)
		expect(Compass.validate({ east: 1 })).toBe(false)
		expect(Compass.validate({ west: 1 })).toBe(false)
		expect(Compass.validate({ south: 1 })).toBe(false)

		expect(Compass.validate({ north: 1, south: 1 })).toBe(false)
		expect(Compass.validate({ east: 1, west: 1 })).toBe(false)

		expect(Compass.validate({ north: 1, south: 1, east: 1 })).toBe(false)
		expect(Compass.validate({ north: 1, south: 1, west: 1 })).toBe(false)
		expect(Compass.validate({ east: 1, west: 1, north: 1 })).toBe(false)
		expect(Compass.validate({ east: 1, west: 1, south: 1 })).toBe(false)

		expect(Compass.validate({ north: 0, east: 1 })).toBe(false)
		expect(Compass.validate({ north: 1, east: 0 })).toBe(false)
		expect(Compass.validate({ north: 0, west: 1 })).toBe(false)
		expect(Compass.validate({ north: 1, west: 0 })).toBe(false)
		expect(Compass.validate({ south: 0, east: 1 })).toBe(false)
		expect(Compass.validate({ south: 1, east: 0 })).toBe(false)
		expect(Compass.validate({ south: 0, west: 1 })).toBe(false)
		expect(Compass.validate({ south: 1, west: 0 })).toBe(false)
	})
	it('validate(): invalids', () => {
		expect(Compass.validate(null)).toBe(false)
		expect(Compass.validate({})).toBe(false)
		expect(Compass.validate('loop')).toBe(false)
		expect(Compass.validate(0)).toBe(false)
		expect(Compass.validate(1)).toBe(false)
		expect(Compass.validate(1.1)).toBe(false)
	})
})

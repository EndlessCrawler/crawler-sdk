import {
	validateCompass,
	CompassDirMaxNumber,
} from '../src'

describe('* ompass', () => {
	it('validate(): true', () => {
		expect(validateCompass({ north: 1, east: 1 })).toBe(true)
		expect(validateCompass({ north: 1, west: 1 })).toBe(true)
		expect(validateCompass({ south: 1, east: 1 })).toBe(true)
		expect(validateCompass({ south: 1, west: 1 })).toBe(true)
		// zeroes are ignored
		expect(validateCompass({ north: 1, east: 1, south: 0, west: 0 })).toBe(true)
		expect(validateCompass({ north: 1, east: 1, south: 0 })).toBe(true)
		expect(validateCompass({ north: 1, east: 1, west: 0 })).toBe(true)

		expect(validateCompass({ north: 1, west: 1, south: 0, east: 0 })).toBe(true)
		expect(validateCompass({ north: 1, west: 1, south: 0 })).toBe(true)
		expect(validateCompass({ north: 1, west: 1, east: 0 })).toBe(true)

		expect(validateCompass({ south: 1, east: 1, north: 0, west: 0 })).toBe(true)
		expect(validateCompass({ south: 1, east: 1, north: 0 })).toBe(true)
		expect(validateCompass({ south: 1, east: 1, west: 0 })).toBe(true)

		expect(validateCompass({ south: 1, west: 1, north: 0, east: 0 })).toBe(true)
		expect(validateCompass({ south: 1, west: 1, north: 0 })).toBe(true)
		expect(validateCompass({ south: 1, west: 1, east: 0 })).toBe(true)

		expect(validateCompass({ north: CompassDirMaxNumber, east: CompassDirMaxNumber })).toBe(true)
		expect(validateCompass({ north: CompassDirMaxNumber, west: CompassDirMaxNumber })).toBe(true)
		expect(validateCompass({ south: CompassDirMaxNumber, east: CompassDirMaxNumber })).toBe(true)
		expect(validateCompass({ south: CompassDirMaxNumber, west: CompassDirMaxNumber })).toBe(true)
	})
	it('validate(): false', () => {
		expect(validateCompass({} as any)).toBe(false)

		expect(validateCompass({ north: 1 } as any)).toBe(false)
		expect(validateCompass({ east: 1 } as any)).toBe(false)
		expect(validateCompass({ west: 1 } as any)).toBe(false)
		expect(validateCompass({ south: 1 } as any)).toBe(false)

		expect(validateCompass({ north: 1, south: 1 } as any)).toBe(false)
		expect(validateCompass({ east: 1, west: 1 } as any)).toBe(false)

		expect(validateCompass({ north: 1, south: 1, east: 1 } as any)).toBe(false)
		expect(validateCompass({ north: 1, south: 1, west: 1 } as any)).toBe(false)
		expect(validateCompass({ east: 1, west: 1, north: 1 } as any)).toBe(false)
		expect(validateCompass({ east: 1, west: 1, south: 1 } as any)).toBe(false)

		expect(validateCompass({ north: 0, south: 0, east: 1 })).toBe(false)
		expect(validateCompass({ north: 0, south: 0, west: 1 })).toBe(false)
		expect(validateCompass({ east: 0, west: 0, north: 1 })).toBe(false)
		expect(validateCompass({ east: 0, west: 0, south: 1 })).toBe(false)

		expect(validateCompass({ north: 0, east: 1 })).toBe(false)
		expect(validateCompass({ north: 1, east: 0 })).toBe(false)
		expect(validateCompass({ north: 0, west: 1 })).toBe(false)
		expect(validateCompass({ north: 1, west: 0 })).toBe(false)
		expect(validateCompass({ south: 0, east: 1 })).toBe(false)
		expect(validateCompass({ south: 1, east: 0 })).toBe(false)
		expect(validateCompass({ south: 0, west: 1 })).toBe(false)
		expect(validateCompass({ south: 1, west: 0 })).toBe(false)
	})
})

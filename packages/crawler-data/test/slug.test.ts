import 'jest-expect-message'
import {
	Compass,
} from '../src/lib/types'
import {
	slugToCompass,
	slugToCoord,
	validateSlug,
	validateCompass,
	compassEquals,
	compassToCoord,
	CompassDirMax,
	CompassDirMaxNumber,
	slugSeparators,
	compassToSlug,
	coordToSlug,
	SlugSeparator,
} from '../src/lib/crawl'

type TestPair = {
	slug: string
	compass: Compass | null
	forwardOnly?: boolean
}

const _slugs: TestPair[] = [
	// invalids
	// { slug: null, compass: null },
	{ slug: '', compass: null },
	{ slug: 'N0,E0', compass: null },
	{ slug: 'N0,W0', compass: null },
	{ slug: 'S0,E0', compass: null },
	{ slug: 'S0,W0', compass: null },
	{ slug: 'N0,E1', compass: null },
	{ slug: 'N0,W1', compass: null },
	{ slug: 'S0,E1', compass: null },
	{ slug: 'S0,W1', compass: null },
	{ slug: 'N1,E0', compass: null },
	{ slug: 'N1,W0', compass: null },
	{ slug: 'S1,E0', compass: null },
	{ slug: 'S1,W0', compass: null },
	{ slug: 'N1,S1,E1,W1', compass: null },
	{ slug: 'N1,S1,E1', compass: null },
	{ slug: 'N1,S1,W1', compass: null },
	{ slug: 'N1,E1,W1', compass: null },
	{ slug: 'S1,E1,W1', compass: null },
	{ slug: 'N1,E1 ', compass: null },
	{ slug: ' N1,E1', compass: null },
	{ slug: ' N1,E1 ', compass: null },
	{ slug: 'NN1,E1', compass: null },
	{ slug: 'N1,EE1', compass: null },
	{ slug: 'ASDN1,E1', compass: null },
	{ slug: 'N1,E1E', compass: null },
	{ slug: 'N1', compass: null },
	{ slug: 'E1', compass: null },
	{ slug: 'W1', compass: null },
	{ slug: 'S1', compass: null },
	// valids
	{ slug: 'N1,E1', compass: { north: 1, east: 1 } },
	{ slug: 'N1,W1', compass: { north: 1, west: 1 } },
	{ slug: 'S1,E1', compass: { south: 1, east: 1 } },
	{ slug: 'S1,W1', compass: { south: 1, west: 1 } },
	{ slug: 'N2,E3', compass: { north: 2, east: 3 } },
	{ slug: 'N4,W5', compass: { north: 4, west: 5 } },
	{ slug: 'S6,E7', compass: { south: 6, east: 7 } },
	{ slug: 'S8,W9', compass: { south: 8, west: 9 } },
	{ slug: 'N111,E218', compass: { north: 111, east: 218 } },
	{ slug: 'N9999,W1', compass: { north: 9999, west: 1 } },
	{ slug: 'S1,E238422', compass: { south: 1, east: 238422 } },
	{ slug: 'S73236032230,W7723692223', compass: { south: 73236032230, west: 7723692223 } },
	// max
	{ slug: `N${CompassDirMax.toString()},E${CompassDirMax.toString()}`, compass: { north: CompassDirMaxNumber, east: CompassDirMaxNumber }, forwardOnly: true },
	{ slug: `N${CompassDirMax.toString()},W${CompassDirMax.toString()}`, compass: { north: CompassDirMaxNumber, west: CompassDirMaxNumber }, forwardOnly: true },
	{ slug: `S${CompassDirMax.toString()},E${CompassDirMax.toString()}`, compass: { south: CompassDirMaxNumber, east: CompassDirMaxNumber }, forwardOnly: true },
	{ slug: `S${CompassDirMax.toString()},W${CompassDirMax.toString()}`, compass: { south: CompassDirMaxNumber, west: CompassDirMaxNumber }, forwardOnly: true },
	// zero padding is ok
	{ slug: 'N01,E01', compass: { north: 1, east: 1 }, forwardOnly: true },
	{ slug: 'N01,W01', compass: { north: 1, west: 1 }, forwardOnly: true },
	{ slug: 'S01,E01', compass: { south: 1, east: 1 }, forwardOnly: true },
	{ slug: 'S01,W01', compass: { south: 1, west: 1 }, forwardOnly: true },
]

const _validateSlug = (pair: TestPair, separator: SlugSeparator) => {
	const slug = pair.slug.replace(',', separator ?? '')
	expect(validateSlug(slug), `Slug [${slug}] is not valid`).toBe(true)
	// convert to Compass
	const asCompass = slugToCompass(slug)
	expect(asCompass, `Slug [${slug}] compass [${JSON.stringify(asCompass)}] should not be null`).not.toBe(null)
	expect(compassEquals(asCompass, pair.compass), `Slug [${slug}] compass [${JSON.stringify(asCompass)}] is not [${JSON.stringify(pair.compass)}]`).toBe(true)
	// convert to coord
	const asCoord = slugToCoord(slug)
	const expectedCoord = compassToCoord(pair.compass)
	expect(asCoord, `Slug [${slug}] coord [${asCoord}] should not be zero`).not.toBe(0n)
	expect(asCoord, `Slug [${slug}] coord [${asCoord}] is not [${expectedCoord}]`).toBe(expectedCoord)
	// backward conversion
	if (!pair.forwardOnly) {
		const slugFromCompass = compassToSlug(pair.compass, separator)
		expect(slugFromCompass, `Compass [${JSON.stringify(pair.compass)}] slug is not [${slug}]`).toBe(slug.toUpperCase())
		const slugFromCoord = coordToSlug(compassToCoord(pair.compass), separator)
		expect(slugFromCoord, `coord [${slugFromCoord}] slug is not [${slug}]`).toBe(slug.toUpperCase())
	}
}

const _invalidateSlug = (slug: string) => {
	expect(validateSlug(slug), `Slug [${slug}] is not invalid`).toBe(false)
	// convert to Compass
	const asCompass = slugToCompass(slug)
	expect(asCompass, `Slug [${slug}] compass [${JSON.stringify(asCompass)}] is not null`).toBe(null)
	// convert to coord
	const asCoord = slugToCoord(slug)
	expect(asCoord, `Slug [${slug}] coord [${asCoord}] is not 0n`).toBe(0n)
}

describe('* slug', () => {
	it('validate/invalidate slugs', () => {
		_slugs.forEach((pair) => {
			const slug = pair.slug
			const compass = pair.compass
			if (compass == null) {
				// Invalid slugs
				expect(validateCompass(compass)).toBe(false)
				_invalidateSlug(slug)
			} else {
				// Valid slugs
				expect(validateCompass(compass)).toBe(true)
				// validate using all separators
				slugSeparators.forEach((s) => {
					_validateSlug(pair, s)
					_validateSlug({ ...pair, slug: slug.toLowerCase(), forwardOnly: true }, s)
				})
				// invalidate bad separators
				_invalidateSlug(slug.replace(',', 'x'))
				_invalidateSlug(slug.replace(',', '?'))
				_invalidateSlug(slug.replace(',', ',,'))
				_invalidateSlug(slug.replace(',', '  '))
				_invalidateSlug(slug.replace(',', ',N1'))
			}
		})
	})
})

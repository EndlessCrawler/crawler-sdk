import 'jest-expect-message'
import {
	createClient,
	LootUnderworld,
	ModuleInterface,
} from '../src'

const CoordMax = LootUnderworld.CoordMax
type Compass = LootUnderworld.Compass

describe('compass.luw', () => {
	let client: ModuleInterface

	beforeAll(() => {
		client = createClient(LootUnderworld.Id) as ModuleInterface
	})

	// TODO...

	it.skip('TODO...', () => {
	})

})

import 'jest-expect-message'
import {
	createClient,
	ModuleId,
	LootUnderworld,
	ModuleInterface,
	Dir,
} from '../src'

const CoordMax = LootUnderworld.CoordMax
type Compass = LootUnderworld.Compass

describe('compass.luw', () => {
	let client: ModuleInterface

	beforeAll(() => {
		client = createClient(ModuleId.LootUnderworld) as ModuleInterface
	})

	// TODO...

	it.skip('TODO...', () => {
	})

})

import 'jest-expect-message'
import {
	createClient,
	ModuleId,
	LootUnderworld,
	ModuleInterface,
	Dir,
} from '../src'

//@ts-ignore
BigInt.prototype.toJSON = function () { return (this <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(this) : this.toString()) }

const CoordMax = LootUnderworld.CoordMax
type Compass = LootUnderworld.Compass

type NumOrBig = number | bigint


describe('coord.luw', () => {
	let client: ModuleInterface

	beforeAll(() => {
		client = createClient(ModuleId.LootUnderworld) as ModuleInterface
	})

	// TODO...

	it.skip('TODO...', () => {
	})

})

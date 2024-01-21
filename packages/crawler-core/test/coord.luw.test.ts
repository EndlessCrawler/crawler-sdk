import 'jest-expect-message'
import {
	createClient,
	LootUnderworld,
	ModuleInterface,
} from '../src'

//@ts-ignore
BigInt.prototype.toJSON = function () { return (this <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(this) : this.toString()) }

const CoordMax = LootUnderworld.CoordMax
type Compass = LootUnderworld.Compass

type NumOrBig = number | bigint


describe('coord.luw', () => {
	let client: ModuleInterface

	beforeAll(() => {
		client = createClient(LootUnderworld.Id) as ModuleInterface
	})

	// TODO...

	it.skip('TODO...', () => {
	})

})

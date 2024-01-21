import {
	createClient,
	ModuleId,
	EndlessCrawler,
	LootUnderworld,
} from '../src'

describe('createClient()', () => {

	it('createClient(EndlessCrawler)', () => {
		expect(ModuleId.EndlessCrawler).toBe(EndlessCrawler.Id)
		const client = createClient(EndlessCrawler.Id)
		expect(client).not.toBe(null)
		expect(client.moduleId).toBe(EndlessCrawler.Id)
	})

	it('createClient(LootUnderworld)', () => {
		expect(ModuleId.LootUnderworld).toBe(LootUnderworld.Id)
		const client = createClient(LootUnderworld.Id)
		expect(client).not.toBe(null)
		expect(client.moduleId).toBe(LootUnderworld.Id)
	})

})

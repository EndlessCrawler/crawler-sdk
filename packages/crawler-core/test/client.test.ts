import {
	createClient,
	ModuleId,
} from '../src'

describe('createClient()', () => {

	it('createClient(EndlessCrawler)', () => {
		const client = createClient(ModuleId.EndlessCrawler)
		expect(client).not.toBe(null)
		expect(client.moduleId).toBe(ModuleId.EndlessCrawler)
	})

	it('createClient(LootUnderworld)', () => {
		const client = createClient(ModuleId.LootUnderworld)
		expect(client).not.toBe(null)
		expect(client.moduleId).toBe(ModuleId.LootUnderworld)
	})

})

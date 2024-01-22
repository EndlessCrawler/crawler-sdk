import 'jest-expect-message'
import {
	mainnetDataSet,
	goerliDataSet,
	allDataSets,
} from '../src'
import {
	ChainId,
	ViewName,
	createClient,
	getAllChainIds,
	EndlessCrawler,
} from '@avante/crawler-core'
import {
	__getData,
	__initializeGlobalModule,
} from '@avante/crawler-core/src/modules/importer'

describe('datasets', () => {
	it('importDataSets()', () => {
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module
		expect(() => client.resolveChainId()).toThrow('InvalidChainError')
		expect(() => client.getDataSet()).toThrow('InvalidChainError')

		client.importDataSets([mainnetDataSet, goerliDataSet])
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		// defaults to the first chain
		const data1 = client.getDataSet()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

	it('getDataSet()', () => {
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module

		const allChainIds = getAllChainIds()
		const allViewNames = client.getViewNames()

		for (let i = 0; i < allChainIds.length; ++i) {
			const chainId = allChainIds[i]
			const data = client.getDataSet({ chainId })
			expect(data).not.toBe(null)

			for (let v = 0; v < allViewNames.length; ++v) {
				const viewName = allViewNames[v] as ViewName
				expect(data[viewName]).not.toBe(null)
				expect(data[viewName]?.chain?.chainId).toBe(chainId)
			}
		}
	})

	it('setCurrentDataSet()', () => {
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module

		const data1 = client.getDataSet({ chainId: ChainId.Mainnet })
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		// new current
		client.setCurrentDataSet({ chainId: ChainId.Goerli })
		expect(client.resolveChainId()).toBe(ChainId.Goerli)
		const data2 = client.getDataSet()
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		// new current
		client.setCurrentDataSet({ chainId: ChainId.Mainnet })
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)
		const data3 = client.getDataSet()
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

	it('allDataSets', () => {
		let allChainIds: ChainId[] = getAllChainIds()
		expect(allDataSets.length, 'allDataSets does not contain all chains').toBe(allChainIds.length)

		// reset globals
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module
		__initializeGlobalModule(EndlessCrawler.Id, true)
		expect(() => client.resolveChainId()).toThrow('InvalidChainError')

		client.importDataSets(allDataSets)
		for (let i = 0; i < allChainIds.length; ++i) {
			const chainId: ChainId = allChainIds[i]
			const data = client.getDataSet({ chainId })
			expect(data).not.toBe(null)
			expect(data.tokenIdToCoord?.chain?.chainId).toBe(chainId)
		}
	})


	// TODOO: test import mixed data sets - throws MixedModulesError()

})

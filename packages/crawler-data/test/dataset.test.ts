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
	getAllNetworkNames,
	EndlessCrawler,
	networkNameToChainId,
	NetworkName,
} from '@avante/crawler-core'
import {
	__getData,
	__initializeGlobalModule,
} from '@avante/crawler-core/src/modules/importer'

describe('datasets', () => {
	it('importDataSets()', () => {
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module
		expect(() => client.resolveChainId()).toThrow('InvalidDataSetError')
		expect(() => client.getDataSet()).toThrow('InvalidDataSetError')
		expect(() => client.getAllViews()).toThrow('InvalidDataSetError')

		client.importDataSets([mainnetDataSet, goerliDataSet])
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		// defaults to the first chain
		const views = client.getAllViews()
		expect(views.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)
		const dataSet = client.getDataSet()
		expect(dataSet.chainId).toBe(ChainId.Mainnet)
	})

	it('getDataSet()', () => {
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module

		const allNetworkNames = getAllNetworkNames()
		const allViewNames = client.getViewNames()

		for (let i = 0; i < allNetworkNames.length; ++i) {
			const dataSetName = allNetworkNames[i]
			const chainId = networkNameToChainId(dataSetName)
			const views = client.getAllViews({ dataSetName })
			expect(views).not.toBe(null)
			const dataSet = client.getDataSet({ dataSetName })
			expect(dataSet.chainId).toBe(chainId)

			for (let v = 0; v < allViewNames.length; ++v) {
				const viewName = allViewNames[v] as ViewName
				expect(views[viewName]).not.toBe(null)
				expect(views[viewName]?.metadata?.chainId).toBe(chainId)
			}
		}
	})

	it('setCurrentDataSet()', () => {
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module

		const data1 = client.getAllViews({ dataSetName: NetworkName.Mainnet })
		expect(data1.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)
		const dataSet1 = client.getDataSet({ dataSetName: NetworkName.Mainnet })
		expect(dataSet1.chainId).toBe(ChainId.Mainnet)

		// new current
		client.setCurrentDataSet({ dataSetName: NetworkName.Goerli })
		expect(client.resolveChainId()).toBe(ChainId.Goerli)
		const data2 = client.getAllViews()
		expect(data2.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Goerli)
		const dataSet2 = client.getDataSet({ dataSetName: NetworkName.Goerli })
		expect(dataSet2.chainId).toBe(ChainId.Goerli)

		// new current
		client.setCurrentDataSet({ dataSetName: NetworkName.Mainnet })
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)
		const data3 = client.getAllViews()
		expect(data3.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)
		const dataSet3 = client.getDataSet({ dataSetName: NetworkName.Mainnet })
		expect(dataSet3.chainId).toBe(ChainId.Mainnet)
	})

	it('allDataSets', () => {
		let allNetworkNames: NetworkName[] = getAllNetworkNames()
		expect(allDataSets.length, 'allDataSets does not contain all chains').toBe(allNetworkNames.length)

		// reset globals
		let client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module
		__initializeGlobalModule(EndlessCrawler.Id, true)
		expect(() => client.resolveChainId()).toThrow('InvalidDataSetError')

		client.importDataSets(allDataSets)
		for (let i = 0; i < allNetworkNames.length; ++i) {
			const dataSetName = allNetworkNames[i]
			const chainId = networkNameToChainId(dataSetName)
			const views = client.getAllViews({ dataSetName })
			expect(views).not.toBe(null)
			expect(views.tokenIdToCoord?.metadata?.chainId).toBe(chainId)
			const dataSet = client.getDataSet({ dataSetName })
			expect(dataSet.chainId).toBe(chainId)
		}
	})


	// TODOO: test import mixed data sets - throws MixedModulesError()

})

import 'jest-expect-message'
import {
	mainnetDataSet,
	goerliDataSet,
} from '../src'
import {
	ChainId,
	createClient,
	EndlessCrawler,
	NetworkName,
} from '@avante/crawler-core'

describe('* data_mainnet', () => {
	let client: EndlessCrawler.Module

	beforeAll(() => {
		client = createClient([mainnetDataSet]) as EndlessCrawler.Module
	})

	it('getDataSet()', () => {
		let datasets1 = client.getDataSetNames()
		expect(datasets1.length).toBe(1)
		expect(datasets1).toEqual(expect.arrayContaining([NetworkName.Mainnet]))

		const data1 = client.getAllViews()
		expect(data1.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		const data2 = client.getAllViews({ dataSetName: NetworkName.Mainnet })
		expect(data2.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)

		expect(() => client.getAllViews({ dataSetName: NetworkName.Goerli })).toThrow('InvalidDataSetError')

		client.importDataSets([goerliDataSet])
		let datasets2 = client.getDataSetNames()
		expect(datasets2.length).toBe(2)
		expect(datasets2).toEqual(expect.arrayContaining([NetworkName.Mainnet, NetworkName.Goerli]))

		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		const data3 = client.getAllViews({ dataSetName: NetworkName.Goerli })
		expect(data3.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Goerli)
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		client.setCurrentDataSet({ dataSetName: NetworkName.Goerli })
		expect(client.resolveChainId()).toBe(ChainId.Goerli)
		const data4 = client.getAllViews()
		expect(data4.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Goerli)
	})

})

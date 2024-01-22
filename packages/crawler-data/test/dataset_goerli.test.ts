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

describe('* data_goerli', () => {
	let client: EndlessCrawler.Module

	beforeAll(() => {
		client = createClient([goerliDataSet]) as EndlessCrawler.Module
	})

	it('getDataSet()', () => {
		const data1 = client.getAllViews()
		expect(data1.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Goerli)
		expect(client.resolveChainId()).toBe(ChainId.Goerli)

		const data2 = client.getAllViews({ dataSetName: NetworkName.Goerli })
		expect(data2.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Goerli)

		expect(() => client.getAllViews({ dataSetName: NetworkName.Mainnet })).toThrow('InvalidDataSetError')

		client.importDataSets([mainnetDataSet])
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Goerli)

		const data3 = client.getAllViews({ dataSetName: NetworkName.Mainnet })
		expect(data3.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Goerli)

		client.setCurrentDataSet({ dataSetName: NetworkName.Mainnet })
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)
		const data4 = client.getAllViews()
		expect(data4.tokenIdToCoord?.metadata?.chainId).toBe(ChainId.Mainnet)


	})

})

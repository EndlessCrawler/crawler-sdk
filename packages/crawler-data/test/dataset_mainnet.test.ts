import 'jest-expect-message'
import {
	mainnetDataSet,
	goerliDataSet,
} from '../src'
import {
	ChainId,
	createClient,
	EndlessCrawler,
} from '@avante/crawler-core'

describe('* data_mainnet', () => {
	let client: EndlessCrawler.Module

	beforeAll(() => {
		client = createClient([mainnetDataSet]) as EndlessCrawler.Module
	})

	it('getDataSet()', () => {
		const data1 = client.getDataSet()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		const data2 = client.getDataSet({ chainId: ChainId.Mainnet })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		expect(() => client.getDataSet({ chainId: ChainId.Goerli })).toThrow('InvalidChainError')

		client.importDataSets([goerliDataSet])
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		const data3 = client.getDataSet({ chainId: ChainId.Goerli })
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)

		client.setCurrentDataSet({ chainId: ChainId.Goerli })
		expect(client.resolveChainId()).toBe(ChainId.Goerli)
		const data4 = client.getDataSet()
		expect(data4.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)
	})

})

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

describe('* data_goerli', () => {
	let client: EndlessCrawler.Module

	beforeAll(() => {
		client = createClient([goerliDataSet]) as EndlessCrawler.Module
	})

	it('getDataSet()', () => {
		const data1 = client.getDataSet()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)
		expect(client.resolveChainId()).toBe(ChainId.Goerli)

		const data2 = client.getDataSet({ chainId: ChainId.Goerli })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		expect(() => client.getDataSet({ chainId: ChainId.Mainnet })).toThrow('InvalidChainError')

		client.importDataSets([mainnetDataSet])
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Goerli)

		const data3 = client.getDataSet({ chainId: ChainId.Mainnet })
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
		// current is still other
		expect(client.resolveChainId()).toBe(ChainId.Goerli)

		client.setCurrentDataSet({ chainId: ChainId.Mainnet })
		expect(client.resolveChainId()).toBe(ChainId.Mainnet)
		const data4 = client.getDataSet()
		expect(data4.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)


	})

})

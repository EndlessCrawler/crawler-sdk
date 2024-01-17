import 'jest-expect-message'
import {
	ChainId,
	initializeDataSet,
	importDataSet,
	getDataSet,
} from '@avante/crawler-core'
import {
	mainnetDataSet,
	goerliDataSet,
} from '../src'

describe('* data_mainnet', () => {

	beforeAll(() => {
		initializeDataSet()
		importDataSet([mainnetDataSet])
	})

	it('getDataSet()', () => {
		const data1 = getDataSet()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		const data2 = getDataSet({ chainId: ChainId.Mainnet })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		expect(() => getDataSet({ chainId: ChainId.Goerli })).toThrow('InvalidCrawlerChainError')

		importDataSet([goerliDataSet])

		const data3 = getDataSet({ chainId: ChainId.Goerli })
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)
	})

})

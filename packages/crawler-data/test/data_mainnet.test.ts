import 'jest-expect-message'
import {
	initializeDataSet,
	importDataSet,
	mainnetDataSet,
	goerliDataSet,
	// ---
	getDataSet,
} from '../src/lib'
import {
	ChainId,
} from '../src/lib/types'

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

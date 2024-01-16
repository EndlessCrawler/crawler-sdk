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

describe('* data_goerli', () => {

	beforeAll(() => {
		initializeDataSet()
		importDataSet([goerliDataSet])
	})

	it('getDataSet()', () => {
		const data1 = getDataSet()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		const data2 = getDataSet({ chainId: ChainId.Goerli })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		expect(() => getDataSet({ chainId: ChainId.Mainnet })).toThrow('InvalidCrawlerChainError')

		importDataSet([mainnetDataSet])

		const data3 = getDataSet({ chainId: ChainId.Mainnet })
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

})

import 'jest-expect-message'
import {
	initializeChainData,
	importChainData,
	mainnetData,
	goerliData,
	// ---
	getChainData,
} from '../src/lib'
import {
	ChainId,
} from '../src/lib/types'

describe('* data_mainnet', () => {

	beforeAll(() => {
		initializeChainData()
		importChainData([mainnetData])
	})

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		const data2 = getChainData({ chainId: ChainId.Mainnet })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		expect(() => getChainData({ chainId: ChainId.Goerli })).toThrow('InvalidCrawlerChainError')

		importChainData([goerliData])

		const data3 = getChainData({ chainId: ChainId.Goerli })
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)
	})

})

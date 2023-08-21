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
	AllViews,
	ChainId,
} from '../src/lib/types'

describe('* data_goerli', () => {

	beforeAll(() => {
		initializeChainData()
		importChainData([goerliData])
	})

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		const data2 = getChainData({ chainId: ChainId.Goerli })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		expect(() => getChainData({ chainId: ChainId.Mainnet })).toThrow('InvalidCrawlerChainError')

		importChainData([mainnetData])

		const data3 = getChainData({ chainId: ChainId.Mainnet })
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

})

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
	AllViews,
} from '../src/lib/types'

describe('* data_mainnet', () => {

	beforeAll(() => {
		initializeChainData()
		importChainData([mainnetData])
	})

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1).not.toBe(null)

		const data2 = getChainData({ chainId: ChainId.Mainnet })
		expect(data2).not.toBe(null)

		expect(data1).toEqual(data2)

		expect(() => getChainData({ chainId: ChainId.Goerli })).toThrow('InvalidCrawlerChainError')

		importChainData([goerliData])

		const data3 = getChainData({ chainId: ChainId.Goerli })
		expect(data1).not.toEqual(data3)
	})

})

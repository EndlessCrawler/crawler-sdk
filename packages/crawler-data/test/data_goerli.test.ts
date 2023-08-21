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
		// console.log(`===== Before`, global)
		initializeChainData()
		// console.log(`===== Cleaned`, global)
		importChainData([goerliData])
		// console.log(`===== Imported`, global)
	})

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1).not.toBe(null)

		const data2 = getChainData({ chainId: ChainId.Goerli })
		expect(data2).not.toBe(null)

		expect(data1).toEqual(data2)

		expect(() => getChainData({ chainId: ChainId.Mainnet })).toThrow('InvalidCrawlerChainError')

		importChainData([mainnetData])

		const data3 = getChainData({ chainId: ChainId.Mainnet })
		expect(data1).not.toEqual(data3)
	})

})

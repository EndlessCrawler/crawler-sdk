import 'jest-expect-message'
import {
	// do better here!
	mainnetData,
	importChainData,
	// ---
	getChainData,
} from '../src/lib'
import {
	ChainId,
	AllViews,
} from '../src/lib/types'

importChainData(ChainId.Mainnet, mainnetData)

describe('* data_mainnet', () => {
	let data: AllViews | null = null

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1).not.toBe(null)

		const data2 = getChainData({ chainId: ChainId.Mainnet })
		expect(data2).not.toBe(null)

		expect(data1).toEqual(data2)

		// should pass only on exported site
		const noData = getChainData({ chainId: ChainId.Goerli })
		expect(noData).toBe(null)

		const data3 = getChainData({ chainId: ChainId.Goerli })
		expect(data1).not.toEqual(data3)
	})

})

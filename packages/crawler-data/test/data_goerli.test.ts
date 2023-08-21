import 'jest-expect-message'
import {
	goerliData,
	importChainData,
	// ---
	getChainData,
} from '../src/lib'
import {
	AllViews,
	ChainId,
} from '../src/lib/types'

importChainData([goerliData])

describe('* data_goerli', () => {
	let data: AllViews | null = null

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1).not.toBe(null)

		const data2 = getChainData({ chainId: ChainId.Goerli })
		expect(data2).not.toBe(null)

		expect(data1).toEqual(data2)

		// should pass only on exported site
		const noData = getChainData({ chainId: ChainId.Mainnet })
		expect(noData).toBe(null)

		const data3 = getChainData({ chainId: ChainId.Mainnet })
		expect(data1).not.toEqual(data3)
	})

})

import 'jest-expect-message'
import {
	mainnetData,
	goerliData,
	importChainData,
	// ---
	getChainData,
	setChainData,
} from '../src/lib'
import {
	AllViews,
	ChainId,
} from '../src/lib/types'

importChainData([mainnetData, goerliData])

describe('* data_mainnet', () => {
	let data: AllViews | null = null

	it('getChainData()', () => {
		const data1 = getChainData({ chainId: ChainId.Mainnet })
		expect(data1).not.toBe(null)

		const data2 = getChainData({ chainId: ChainId.Goerli })
		expect(data2).not.toBe(null)

		expect(data1).not.toEqual(data2)
	})

	it('setChainData()', () => {
		const data1 = getChainData({ chainId: ChainId.Mainnet })
		expect(data1).not.toBe(null)

		// new current
		setChainData({ chainId: ChainId.Goerli })
		// get current
		const data2 = getChainData()
		expect(data2).not.toBe(null)

		// should be different
		expect(data1).not.toEqual(data2)

		// new current
		setChainData({ chainId: ChainId.Mainnet })
		// get current
		const data3 = getChainData()
		expect(data3).not.toBe(null)

		// compare the three
		expect(data3).toEqual(data1)
		expect(data3).not.toEqual(data2)
	})

})

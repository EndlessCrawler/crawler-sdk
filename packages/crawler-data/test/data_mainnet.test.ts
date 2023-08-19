import 'jest-expect-message'
import {
	_mainnet_,
	getChainData,
} from '../src/lib/data'
import {
	AllViews,
	ChainId,
} from '../src/lib/types'

describe.skip('* data_mainnet', () => {
	let data: AllViews | null = null

	it('getChainData()', () => {
		const data1 = getChainData()
		expect(data1).not.toBe(null)

		const data2 = getChainData(ChainId.Mainnet)
		expect(data2).not.toBe(null)

		expect(data1).toEqual(data2)

		// should pass only on exported site
		const noData = getChainData(ChainId.Goerli)
		expect(noData).toBe(null)

		// const data3 = getChainData(ChainId.Goerli)
		// expect(data1).not.toEqual(data3)
	})

})

import 'jest-expect-message'
import {
	_mainnet_,
	_goerli_,
	getChainData,
	switchChainData,
} from '../src/lib/data'
import {
	AllViews,
	ChainId,
} from '../src/lib/types'

describe('* data_mainnet', () => {
	let data: AllViews | null = null

	it('getChainData()', () => {
		const data1 = getChainData(ChainId.Mainnet)
		expect(data1).not.toBe(null)

		const data2 = getChainData(ChainId.Goerli)
		expect(data2).not.toBe(null)

		expect(data1).not.toEqual(data2)
	})

	it('switchChainData()', () => {
		const data1 = getChainData(ChainId.Mainnet)
		expect(data1).not.toBe(null)

		// new current
		switchChainData(ChainId.Goerli)
		// get current
		const data2 = getChainData()
		expect(data2).not.toBe(null)

		// should be different
		expect(data1).not.toEqual(data2)

		// new current
		switchChainData(ChainId.Mainnet)
		// get current
		const data3 = getChainData()
		expect(data3).not.toBe(null)

		// compare the three
		expect(data3).toEqual(data1)
		expect(data3).not.toEqual(data2)
	})

})

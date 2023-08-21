import 'jest-expect-message'
import {
	initializeChainData,
	importChainData,
	mainnetData,
	goerliData,
	// ---
	getChainData,
	setChainData,
} from '../src/lib'
import {
	AllViews,
	ChainId,
} from '../src/lib/types'

describe('* data_mainnet', () => {

	it('importChainData()', () => {
		expect(() => getChainData()).toThrow('CrawlerChainNotSetError')

		initializeChainData()
		
		expect(() => getChainData()).toThrow('CrawlerChainNotSetError')

		importChainData([mainnetData, goerliData])

		const data1 = getChainData()
		expect(data1).not.toBe(null)

		const data2 = getChainData({ chainId: ChainId.Mainnet })
		expect(data2).not.toBe(null)

		expect(data1).toEqual(data2)
	})

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
		expect(data2).not.toEqual(data1)

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

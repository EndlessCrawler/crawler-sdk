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

		// defaults to the first chain
		const data1 = getChainData()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

	it('getChainData()', () => {
		const data1 = getChainData({ chainId: ChainId.Mainnet })
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		const data2 = getChainData({ chainId: ChainId.Goerli })
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)
	})

	it('setChainData()', () => {
		const data1 = getChainData({ chainId: ChainId.Mainnet })
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		// new current
		setChainData({ chainId: ChainId.Goerli })
		const data2 = getChainData()
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		// new current
		setChainData({ chainId: ChainId.Mainnet })
		const data3 = getChainData()
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

})

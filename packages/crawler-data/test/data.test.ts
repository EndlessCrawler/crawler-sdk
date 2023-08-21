import 'jest-expect-message'
import {
	initializeChainData,
	importChainData,
	mainnetData,
	goerliData,
	// ---
	getChainData,
	setChainData,
	getAllChainIds,
	getViewNames,
} from '../src/lib'
import {
	ChainId, ViewName,
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
		const allChainIds = getAllChainIds()
		const allViewNames = getViewNames()

		for (let i = 0; i < allChainIds.length; ++i) {
			const chainId = allChainIds[i]
			const data = getChainData({ chainId })
			expect(data).not.toBe(null)

			for (let v = 0; v < allViewNames.length; ++v) {
				const viewName = allViewNames[v] as ViewName
				expect(data[viewName]).not.toBe(null)
				expect(data[viewName]?.chain?.chainId).toBe(chainId)
			}
		}
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

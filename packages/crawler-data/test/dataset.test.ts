import 'jest-expect-message'
import {
	ChainId, ViewName,
	initializeDataSet,
	importDataSet,
	getDataSet,
	setDataSet,
	getAllChainIds,
	getViewNames,
} from '@avante/crawler-core'
import {
	mainnetDataSet,
	goerliDataSet,
	allDataSets,
} from '../src'

describe('* data_mainnet', () => {

	it('importDataSet()', () => {
		expect(() => getDataSet()).toThrow('CrawlerChainNotSetError')

		initializeDataSet()
		
		expect(() => getDataSet()).toThrow('CrawlerChainNotSetError')

		importDataSet([mainnetDataSet, goerliDataSet])

		// defaults to the first chain
		const data1 = getDataSet()
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

	it('getDataSet()', () => {
		const allChainIds = getAllChainIds()
		const allViewNames = getViewNames()

		for (let i = 0; i < allChainIds.length; ++i) {
			const chainId = allChainIds[i]
			const data = getDataSet({ chainId })
			expect(data).not.toBe(null)

			for (let v = 0; v < allViewNames.length; ++v) {
				const viewName = allViewNames[v] as ViewName
				expect(data[viewName]).not.toBe(null)
				expect(data[viewName]?.chain?.chainId).toBe(chainId)
			}
		}
	})

	it('setDataSet()', () => {
		const data1 = getDataSet({ chainId: ChainId.Mainnet })
		expect(data1.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)

		// new current
		setDataSet({ chainId: ChainId.Goerli })
		const data2 = getDataSet()
		expect(data2.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Goerli)

		// new current
		setDataSet({ chainId: ChainId.Mainnet })
		const data3 = getDataSet()
		expect(data3.tokenIdToCoord?.chain?.chainId).toBe(ChainId.Mainnet)
	})

	it('allDataSets', () => {
		let allChainIds: ChainId[] = getAllChainIds()

		expect(allDataSets.length, 'allDataSets does not contain all chains').toBe(allChainIds.length)

		initializeDataSet()
		importDataSet(allDataSets)

		for (let i = 0; i < allChainIds.length; ++i) {
			const chainId: ChainId = allChainIds[i]
			const data = getDataSet({ chainId })
			expect(data).not.toBe(null)
			expect(data.tokenIdToCoord?.chain?.chainId).toBe(chainId)
		}
	})

})
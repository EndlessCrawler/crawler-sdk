import {
	ChainId,
	Options,
	AllViews,
	DataSet,
	InvalidCrawlerChainError,
	CrawlerChainNotSetError,
} from '../types'
import {
	isBrowser,
	isNode,
} from '../utils'


//@ts-ignore
let _global: any = null
//@ts-ignore
if (isBrowser()) _global = window
//@ts-ignore
if (isNode()) _global = global

// initialize global scope namespace
export interface CrawlerDataNamespace {
	currentChainId: ChainId
	data: Record<ChainId, AllViews>
}
declare global {
	interface Window { CrawlerData: CrawlerDataNamespace }
}

/** used internally to initialzie and clear the global scope */
export const initializeDataSet = (force: boolean = false) => {
	if (_global && (!_global.CrawlerData || force)) {
		_global.CrawlerData = {
			currentChainId: 0,
			data: {},
		}
	}
}

/** used internally to load imported chain data into global scope
 * @param options.chainId array of DataSet to import. The first chain will be set as the current, if none set yet
 */
export const importDataSet = (dataSet: DataSet[]) => {
	if (_global) {
		initializeDataSet()
		dataSet.forEach((set) => {
			_global.CrawlerData.data[set.chainId] = set.data
			if (_global.CrawlerData.currentChainId == 0) {
				_global.CrawlerData.currentChainId = set.chainId
			}
		})
	}
}

/** called by clients to switch current default chain data
 * @param options.chainId The chainId to use
 */
export const setDataSet = (options: Options) => {
	if (options.chainId && _global?.CrawlerData?.data[options.chainId]) {
		_global.CrawlerData.currentChainId = options.chainId
		return
	}
	//@ts-ignore
	throw new InvalidCrawlerChainError(options.chainId)
}

/** called by clients to get chain data
 * @param options.chainId The specified chainId, or chain set by setDataSet()
 * @returns the full chain data, throws error if chain is invalid
 */
export const getDataSet = (options: Options = {}): AllViews => {
	if (_global?.CrawlerData) {
		// use specified chain
		if (options.chainId) {
			if (_global.CrawlerData.data[options.chainId]) {
				return _global.CrawlerData.data[options.chainId]
			}
			throw new InvalidCrawlerChainError(options.chainId)
		}
		// try default loaded chain
		if (_global.CrawlerData.currentChainId) {
			if (_global.CrawlerData.data[_global.CrawlerData.currentChainId]) {
				return _global.CrawlerData.data[_global.CrawlerData.currentChainId]
			}
			throw new InvalidCrawlerChainError(_global.CrawlerData.currentChainId)
		}
	}
	//@ts-ignore
	throw new CrawlerChainNotSetError()
}

/** @returns the currently selected chain id */
export const resolveChainId = (options: Options = {}): ChainId => {
	if (options.chainId) {
		return options.chainId
	}
	if (_global?.CrawlerData?.currentChainId) {
		return _global.CrawlerData.currentChainId
	}
	throw new CrawlerChainNotSetError()
}
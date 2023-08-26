import {
	ChainId,
	Options,
	AllViews,
	ChainData,
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
export const initializeChainData = (force: boolean = false) => {
	if (_global && (!_global.CrawlerData || force)) {
		_global.CrawlerData = {
			currentChainId: 0,
			data: {},
		}
	}
}

/** used internally to load imported chain data into global scope
 * @param options.chainId array of ChainData to import. The first chain will be set as the current, if none set yet
 */
export const importChainData = (chainData: ChainData[]) => {
	if (_global) {
		initializeChainData()
		chainData.forEach((cd) => {
			_global.CrawlerData.data[cd.chainId] = cd.data
			if (_global.CrawlerData.currentChainId == 0) {
				_global.CrawlerData.currentChainId = cd.chainId
			}
		})
	}
}

/** called by clients to switch current default chain data
 * @param options.chainId The chainId to use
 */
export const setChainData = (options: Options) => {
	if (options.chainId && _global?.CrawlerData?.data[options.chainId]) {
		_global.CrawlerData.currentChainId = options.chainId
		return
	}
	//@ts-ignore
	throw new InvalidCrawlerChainError(options.chainId)
}

/** called by clients to get chain data
 * @param options.chainId The specified chainId, or chain set by setChainData()
 * @returns the full chain data, throws error if chain is invalid
 */
export const getChainData = (options: Options = {}): AllViews => {
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

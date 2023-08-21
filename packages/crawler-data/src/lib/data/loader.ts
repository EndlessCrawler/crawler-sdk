import {
	ChainId,
	Options,
	AllViews,
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

if (_global) {
	_global.CrawlerData = {
		currentChainId: 0,
		data: {},
	}
}

/** used internally to load imported chain data into global scope */
export const importChainData = (chainId: ChainId, data: AllViews) => {
	if (_global) {
		_global.CrawlerData.data[chainId] = data
		if (_global.CrawlerData.currentChainId == 0) {
			_global.CrawlerData.currentChainId = chainId
		}
	}
}

/** called by clients to switch current default chain data */
export const setChainData = (options: Options) => {
	if (_global) {
		_global.CrawlerData.currentChainId = options.chainId
	}
}

/** called by clients to get chain data */
export const getChainData = (options: Options = {}): AllViews => {
	if (options.chainId && _global.CrawlerData.data[options.chainId]) {
		return _global.CrawlerData.data[options.chainId]
	}
	if (_global.CrawlerData.data[_global.CrawlerData.currentChainId]) {
		return _global.CrawlerData.data[_global.CrawlerData.currentChainId]
	}
	//@ts-ignore
	throw (`Invalid Crawler chain [${_global.CrawlerData.data[options.chainId]}] or [${_global.CrawlerData.currentChainId}]`)
}

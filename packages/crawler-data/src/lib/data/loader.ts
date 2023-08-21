import {
	AllViews,
	ChainId,
} from '../types'
import {
	isBrowser,
	isNode,
} from '../utils'

//
// add only imported chains
//

export interface CrawlerDataNamespace {
	currentChainId: ChainId
	data: Record<ChainId, AllViews>
}

declare global {
	interface Window { CrawlerData: CrawlerDataNamespace }
}

//@ts-ignore
let _global: any = null
//@ts-ignore
if (isBrowser()) _global = window
//@ts-ignore
if (isNode()) _global = global

//
// initialize namespace
if (_global) {
	_global.CrawlerData = {
		currentChainId: 0,
		data: {},
	}
}

//
// called when importing chain data scripts
export const loadChainData = (chainId: ChainId, data: AllViews) => {
	if (_global) {
		_global.CrawlerData.data[chainId] = data
		if (_global.CrawlerData.currentChainId == 0) {
			_global.CrawlerData.currentChainId = chainId
		}
	}
}

//
// called by clients to switch current chain data
export const setChainData = (chainId: ChainId) => {
	if (_global) {
		_global.CrawlerData.currentChainId = chainId
	}
}

//
// called by clients to get chain data
export const getChainData = (chainId: ChainId | null = null): AllViews | null => {
	if (_global) {
		return _global.CrawlerData.data[chainId ?? _global.CrawlerData.currentChainId] ?? null
	}
	return null
}

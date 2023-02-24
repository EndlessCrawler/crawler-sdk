import * as T from './types'



//--------------------------------
// Import data
//

// TODO: Import only selected network
// ex: import { mainnet, getView } from ...

import _mainnet_tokenIdToCoord from '../data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from '../data/mainnet/chamberData.json'
import _goerli_tokenIdToCoord from '../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../data/goerli/chamberData.json'

const _data: Record<T.ChainId, T.AllViews> = {
	[T.ChainId.Mainnet]: {
		[T.ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord,
		[T.ViewName.chamberData]: _mainnet_chamberData,
	},
	[T.ChainId.Goerli]: {
		[T.ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord,
		[T.ViewName.chamberData]: _goerli_chamberData,
	},
}


//--------------------------------
// Views
//

/**
 ** @returns all the views names
 */
const getViewNames = (): string[] => {
	return Object.keys(T.ViewName)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns all the views of a network
 */
const getAllViews = (chainId: T.ChainId = T.ChainId.Mainnet): T.AllViews => {
	return _data[chainId]
}

const getView = (viewName: T.ViewName, chainId: T.ChainId = T.ChainId.Mainnet): T.AllViews[keyof T.AllViews] => {
	return _data[chainId]?.[viewName]
}

const validateView = (viewName: T.ViewName, view: object): boolean => {
	return typeof (view) == typeof (getView(viewName))
}


//--------------------------------
// Exports
//

export {
	getViewNames,
	getAllViews,
	getView,
	validateView,
}

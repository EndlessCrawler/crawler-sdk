import {
	ChainId,
	ViewName,
	AllViews,
} from './types'



//--------------------------------
// Import data
//

// TODO: Import only selected network
// ex: import { mainnet, getView } from ...

import _mainnet_tokenIdToCoord from '../data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from '../data/mainnet/chamberData.json'
import _goerli_tokenIdToCoord from '../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../data/goerli/chamberData.json'

const _data: Record<ChainId, AllViews> = {
	[ChainId.Mainnet]: {
		[ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord,
		[ViewName.chamberData]: _mainnet_chamberData,
	},
	[ChainId.Goerli]: {
		[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord,
		[ViewName.chamberData]: _goerli_chamberData,
	},
}


//--------------------------------
// Views
//

/**
 ** @returns all the views names
 */
export const getViewNames = (): string[] => {
	return Object.keys(ViewName)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns all the views of a network
 */
export const getAllViews = (chainId: ChainId = ChainId.Mainnet): AllViews => {
	return _data[chainId]
}

export const getView = (viewName: ViewName, chainId: ChainId = ChainId.Mainnet): AllViews[keyof AllViews] => {
	return _data[chainId]?.[viewName]
}

export const validateView = (viewName: ViewName, view: object): boolean => {
	return typeof (view) == typeof (getView(viewName))
}

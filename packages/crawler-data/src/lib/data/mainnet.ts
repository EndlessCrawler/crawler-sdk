import {
	AllViews,
	ViewName,
	ChainId,
	ChainData,
} from '../types'

import _mainnet_tokenIdToCoord from '../../data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from '../../data/mainnet/chamberData.json'

const _mainnet_data_: AllViews = {
	[ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord,
	[ViewName.chamberData]: _mainnet_chamberData,
}

export const mainnetData: ChainData = {
	chainId: ChainId.Mainnet,
	data: _mainnet_data_,
}

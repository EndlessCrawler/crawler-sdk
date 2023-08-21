import {
	AllViews,
	ViewName,
} from '../types'

import _mainnet_tokenIdToCoord from '../../data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from '../../data/mainnet/chamberData.json'

export const mainnetData: AllViews = {
	[ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord,
	[ViewName.chamberData]: _mainnet_chamberData,
}

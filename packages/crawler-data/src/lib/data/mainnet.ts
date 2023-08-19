import {
	AllViews,
	ChainId,
	ViewName,
} from '../types'
import { importData } from './importer'

import _mainnet_tokenIdToCoord from '../../data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from '../../data/mainnet/chamberData.json'

export const _mainnet_: AllViews = {
	[ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord,
	[ViewName.chamberData]: _mainnet_chamberData,
}

importData(ChainId.Mainnet, _mainnet_)

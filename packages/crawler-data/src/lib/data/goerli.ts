import {
	AllViews,
	ChainId,
	ViewName,
} from '../types'
import { loadChainData } from './loader'

import _goerli_tokenIdToCoord from '../../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../../data/goerli/chamberData.json'

export const _goerli_: AllViews = {
	[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord,
	[ViewName.chamberData]: _goerli_chamberData,
}

loadChainData(ChainId.Goerli, _goerli_)

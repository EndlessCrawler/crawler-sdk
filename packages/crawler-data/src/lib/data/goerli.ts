import {
	AllViews,
	ViewName,
	ChainId,
	ChainData,
} from '../types'

import _goerli_tokenIdToCoord from '../../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../../data/goerli/chamberData.json'

const _goerli_data_: AllViews = {
	[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord,
	[ViewName.chamberData]: _goerli_chamberData,
}

export const goerliData: ChainData = {
	chainId: ChainId.Goerli,
	data: _goerli_data_,
}

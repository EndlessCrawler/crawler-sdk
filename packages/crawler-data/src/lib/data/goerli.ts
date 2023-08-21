import {
	AllViews,
	ViewName,
} from '../types'

import _goerli_tokenIdToCoord from '../../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../../data/goerli/chamberData.json'

export const goerliData: AllViews = {
	[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord,
	[ViewName.chamberData]: _goerli_chamberData,
}

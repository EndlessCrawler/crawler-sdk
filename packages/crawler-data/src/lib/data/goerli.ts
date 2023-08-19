import {
	AllViews,
	ChainId,
	ViewName,
} from '../types'
import { importData } from './importer'

import _goerli_tokenIdToCoord from '../../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../../data/goerli/chamberData.json'

export const _goerli_: AllViews = {
	[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord,
	[ViewName.chamberData]: _goerli_chamberData,
}

importData(ChainId.Goerli, _goerli_)

import {
	ModuleId,
	ChainId,
	DataSet,
	ViewName,
	ViewT,
	ChamberDataViewData,
	TokenIdToCoordsViewData,
} from '@avante/crawler-core'

//-------------------------------
// Ethereum Mainnet
//
import _mainnet_tokenIdToCoord from './data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from './data/mainnet/chamberData.json'
export const mainnetDataSet: DataSet = {
	moduleId: ModuleId.EndlessCrawler,
	chainId: ChainId.Mainnet,
	data: {
		[ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord as ViewT<TokenIdToCoordsViewData>,
		[ViewName.chamberData]: _mainnet_chamberData as ViewT<ChamberDataViewData>,
	},
}

//-------------------------------
// Ethereum Goerli testnet
//
import _goerli_tokenIdToCoord from './data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from './data/goerli/chamberData.json'
export const goerliDataSet: DataSet = {
	moduleId: ModuleId.EndlessCrawler,
	chainId: ChainId.Goerli,
	data: {
		[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord as ViewT<TokenIdToCoordsViewData>,
		[ViewName.chamberData]: _goerli_chamberData as ViewT<ChamberDataViewData>,
	},
}


//-------------------------------
// Export single 
//
export const allDataSets: DataSet[] = [mainnetDataSet, goerliDataSet]
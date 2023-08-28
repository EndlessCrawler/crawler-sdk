import {
	ChainId,
	ChainData,
	ViewName,
	ViewT,
	ChamberDataViewData,
	TokenIdToCoordsViewData,
} from '../types'

//-------------------------------
// Ethereum Mainnet
//
import _mainnet_tokenIdToCoord from '../../data/mainnet/tokenIdToCoord.json'
import _mainnet_chamberData from '../../data/mainnet/chamberData.json'
export const mainnetData: ChainData = {
	chainId: ChainId.Mainnet,
	data: {
		[ViewName.tokenIdToCoord]: _mainnet_tokenIdToCoord as ViewT<TokenIdToCoordsViewData>,
		[ViewName.chamberData]: _mainnet_chamberData as ViewT<ChamberDataViewData>,
	},
}

//-------------------------------
// Ethereum Goerli testnet
//
import _goerli_tokenIdToCoord from '../../data/goerli/tokenIdToCoord.json'
import _goerli_chamberData from '../../data/goerli/chamberData.json'
export const goerliData: ChainData = {
	chainId: ChainId.Goerli,
	data: {
		[ViewName.tokenIdToCoord]: _goerli_tokenIdToCoord as ViewT<TokenIdToCoordsViewData>,
		[ViewName.chamberData]: _goerli_chamberData as ViewT<ChamberDataViewData>,
	},
}


//-------------------------------
// Export single 
//
export const allChainData: ChainData[] = [mainnetData, goerliData]
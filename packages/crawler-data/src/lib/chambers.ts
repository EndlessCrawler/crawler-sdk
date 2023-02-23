import {
	ChainId,
	ViewName,
	TokenIdToCoordsView,
	ChamberCoords,
	ChamberDataView,
	ChamberData,
	BNString,
} from './types'
import {
	getView,
} from './views'


/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total minted chambers count
 */
const getChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId)
	return Object.keys(tokenIdToCoord).length
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @param tokenId the token id
 ** @returns the coordinates of the chamber
 */
const getTokenIdToCoords = (tokenId: number, chainId: ChainId = ChainId.Mainnet): ChamberCoords | null => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return tokenIdToCoord[tokenId] ?? null
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @param coord chamber coordinate (BN)
 */
const getChamberData = (coord: BNString, chainId: ChainId = ChainId.Mainnet): ChamberData | null => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return chamberData[coord] ?? null
}


//--------------------------------
// Exports
//

export {
	getChamberCount,
	getTokenIdToCoords,
	getChamberData,
}

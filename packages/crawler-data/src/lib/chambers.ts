import {
	ChainId,
	ViewName,
	ChamberDataView,
	TokenIdToCoordsView,
	ChamberData,
	ChamberCoords,
	BigIntString,
} from './types'
import { getView } from './views'


//---------------------------
// ViewName.tokenIdToCoord
//

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total minted chambers count
 */
export const getChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId)
	return Object.keys(tokenIdToCoord).length
}

/**
 ** @param tokenId the token id
 ** @param chainId the network chain id (1 or 5)
 ** @returns the coordinates of the chamber
 */
export const getTokenCoords = (tokenId: number, chainId: ChainId = ChainId.Mainnet): ChamberCoords | null => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return tokenIdToCoord[tokenId] ?? null
}

/**
 ** @param tokenIds the token ids
 ** @param chainId the network chain id (1 or 5)
 ** @returns the coordinates of multiple chambers
 */
export const getTokensCoords = (tokenIds: number[], chainId: ChainId = ChainId.Mainnet): TokenIdToCoordsView => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return Object.entries(tokenIdToCoord).reduce(function (result, [key, value]) {
		const tokenId = parseInt(key)
		if (tokenIds.includes(tokenId)) {
			result[tokenId] = value
		}
		return result
	}, {} as TokenIdToCoordsView)
}




//---------------------------
// ViewName.chamberData
//


/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total static chambers count
 */
export const getStaticChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.values(chamberData).reduce(function (count, value) {
		return count + (value.isStatic ? 1 : 0)
	}, 0)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
export const getEdgeChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.values(chamberData).reduce(function (result, value) {
		return result + (value.isStatic ? 0 : 1)
	}, 0)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
export const getEdgeChambersCoord = (chainId: ChainId = ChainId.Mainnet): BigIntString[] => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return Object.values(chamberData).reduce(function (result, value) {
		if (!value.isStatic) {
			result.push(tokenIdToCoord[value.tokenId].coord)
		}
		return result
	}, [] as BigIntString[])
}
	
/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
export const getEdgeChambersId = (chainId: ChainId = ChainId.Mainnet): number[] => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.values(chamberData).reduce(function (result, value) {
		if (!value.isStatic) {
			result.push(value.tokenId)
		}
		return result
	}, [] as number[])
}

/**
 ** @param coord chamber coordinate (bigint)
 ** @param chainId the network chain id (1 or 5)
 ** @returns ChamberData of the chamber
 */
export const getChamberData = (coord: BigIntString, chainId: ChainId = ChainId.Mainnet): ChamberData | null => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return chamberData[coord] ?? null
}

/**
 ** @param coords chambers coordinates (bigint)
 ** @param chainId the network chain id (1 or 5)
 ** @returns ChamberData of multiple chambers
 */
export const getChambersData = (coords: BigIntString[], chainId: ChainId = ChainId.Mainnet): ChamberDataView => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.entries(chamberData).reduce(function (result, [key, value]) {
		if (coords.includes(key)) {
			result[key] = value
		}
		return result
	}, {} as ChamberDataView)
}

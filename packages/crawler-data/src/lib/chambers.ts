import * as T from './types'
import { getView } from './views'


/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total minted chambers count
 */
const getChamberCount = (chainId: T.ChainId = T.ChainId.Mainnet): number => {
	const tokenIdToCoord = getView(T.ViewName.tokenIdToCoord, chainId)
	return Object.keys(tokenIdToCoord).length
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total static chambers count
 */
const getStaticChamberCount = (chainId: T.ChainId = T.ChainId.Mainnet): number => {
	const chamberData: T.ChamberDataView = getView(T.ViewName.chamberData, chainId) as T.ChamberDataView
	return Object.values(chamberData).reduce(function (count, value) {
		return count + (value.isStatic ? 1 : 0)
	}, 0)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
const getEdgeChamberCount = (chainId: T.ChainId = T.ChainId.Mainnet): number => {
	const chamberData: T.ChamberDataView = getView(T.ViewName.chamberData, chainId) as T.ChamberDataView
	return Object.values(chamberData).reduce(function (result, value) {
		return result + (value.isStatic ? 0 : 1)
	}, 0)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
const getEdgeChambersId = (chainId: T.ChainId = T.ChainId.Mainnet): number[] => {
	const chamberData: T.ChamberDataView = getView(T.ViewName.chamberData, chainId) as T.ChamberDataView
	return Object.values(chamberData).reduce(function (result, value) {
		if (!value.isStatic) {
			result.push(value.tokenId)
		}
		return result
	}, [] as number[])
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
const getEdgeChambersCoord = (chainId: T.ChainId = T.ChainId.Mainnet): T.BNString[] => {
	const chamberData: T.ChamberDataView = getView(T.ViewName.chamberData, chainId) as T.ChamberDataView
	const tokenIdToCoord = getView(T.ViewName.tokenIdToCoord, chainId) as T.TokenIdToCoordsView
	return Object.values(chamberData).reduce(function (result, value) {
		if (!value.isStatic) {
			result.push(tokenIdToCoord[value.tokenId].coord)
		}
		return result
	}, [] as T.BNString[])
}

/**
 ** @param tokenId the token id
 ** @param chainId the network chain id (1 or 5)
 ** @returns the coordinates of the chamber
 */
const getTokenCoords = (tokenId: number, chainId: T.ChainId = T.ChainId.Mainnet): T.ChamberCoords | null => {
	const tokenIdToCoord = getView(T.ViewName.tokenIdToCoord, chainId) as T.TokenIdToCoordsView
	return tokenIdToCoord[tokenId] ?? null
}

/**
 ** @param tokenIds the token ids
 ** @param chainId the network chain id (1 or 5)
 ** @returns the coordinates of multiple chambers
 */
const getTokensCoords = (tokenIds: number[], chainId: T.ChainId = T.ChainId.Mainnet): T.TokenIdToCoordsView => {
	const tokenIdToCoord = getView(T.ViewName.tokenIdToCoord, chainId) as T.TokenIdToCoordsView
	return Object.entries(tokenIdToCoord).reduce(function (result, [key, value]) {
		const tokenId = parseInt(key)
		if (tokenIds.includes(tokenId)) {
			result[tokenId] = value
		}
		return result
	}, {} as T.TokenIdToCoordsView)
}

/**
 ** @param coord chamber coordinate (BN)
 ** @param chainId the network chain id (1 or 5)
 ** @returns ChamberData of the chamber
 */
const getChamberData = (coord: T.BNString, chainId: T.ChainId = T.ChainId.Mainnet): T.ChamberData | null => {
	const chamberData: T.ChamberDataView = getView(T.ViewName.chamberData, chainId) as T.ChamberDataView
	return chamberData[coord] ?? null
}

/**
 ** @param coords chambers coordinates (BN)
 ** @param chainId the network chain id (1 or 5)
 ** @returns ChamberData of multiple chambers
 */
const getChambersData = (coords: T.BNString[], chainId: T.ChainId = T.ChainId.Mainnet): T.ChamberDataView => {
	const chamberData: T.ChamberDataView = getView(T.ViewName.chamberData, chainId) as T.ChamberDataView
	return Object.entries(chamberData).reduce(function (result, [key, value]) {
		if (coords.includes(key)) {
			result[key] = value
		}
		return result
	}, {} as T.ChamberDataView)
}


//--------------------------------
// Exports
//

export {
	getChamberCount,
	getStaticChamberCount,
	getEdgeChamberCount,
	getEdgeChambersId,
	getEdgeChambersCoord,
	getTokenCoords,
	getTokensCoords,
	getChamberData,
	getChambersData,
}

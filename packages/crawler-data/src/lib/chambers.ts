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
 ** @returns total static chambers count
 */
const getStaticChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.values(chamberData).reduce(function (count, value) {
		return count + (value.isStatic ? 1 : 0)
	}, 0)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
const getEdgeChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.values(chamberData).reduce(function (result, value) {
		return result + (value.isStatic ? 0 : 1)
	}, 0)
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
const getEdgeChambersId = (chainId: ChainId = ChainId.Mainnet): number[] => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
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
const getEdgeChambersCoord = (chainId: ChainId = ChainId.Mainnet): BNString[] => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return Object.values(chamberData).reduce(function (result, value) {
		if (!value.isStatic) {
			result.push(tokenIdToCoord[value.tokenId].coord)
		}
		return result
	}, [] as BNString[])
}

/**
 ** @param tokenId the token id
 ** @param chainId the network chain id (1 or 5)
 ** @returns the coordinates of the chamber
 */
const getTokenCoords = (tokenId: number, chainId: ChainId = ChainId.Mainnet): ChamberCoords | null => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return tokenIdToCoord[tokenId] ?? null
}

/**
 ** @param tokenIds the token ids
 ** @param chainId the network chain id (1 or 5)
 ** @returns the coordinates of multiple chambers
 */
const getTokensCoords = (tokenIds: number[], chainId: ChainId = ChainId.Mainnet): TokenIdToCoordsView => {
	const tokenIdToCoord = getView(ViewName.tokenIdToCoord, chainId) as TokenIdToCoordsView
	return Object.entries(tokenIdToCoord).reduce(function (result, [key, value]) {
		const tokenId = parseInt(key)
		if (tokenIds.includes(tokenId)) {
			result[tokenId] = value
		}
		return result
	}, {} as TokenIdToCoordsView)
}

/**
 ** @param coord chamber coordinate (BN)
 ** @param chainId the network chain id (1 or 5)
 ** @returns ChamberData of the chamber
 */
const getChamberData = (coord: BNString, chainId: ChainId = ChainId.Mainnet): ChamberData | null => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return chamberData[coord] ?? null
}

/**
 ** @param coords chambers coordinates (BN)
 ** @param chainId the network chain id (1 or 5)
 ** @returns ChamberData of multiple chambers
 */
const getChambersData = (coords: BNString[], chainId: ChainId = ChainId.Mainnet): ChamberDataView => {
	const chamberData: ChamberDataView = getView(ViewName.chamberData, chainId) as ChamberDataView
	return Object.entries(chamberData).reduce(function (result, [key, value]) {
		if (coords.includes(key)) {
			result[key] = value
		}
		return result
	}, {} as ChamberDataView)
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

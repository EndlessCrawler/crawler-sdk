import {
	Options,
	ViewName,
	ViewT,
	ChamberDataViewData,
	TokenIdToCoordsViewData,
	ChamberData,
	ChamberCoords,
	BigIntString,
} from '../types'
import { getView } from './views'


//---------------------------
// ViewName.tokenIdToCoord
//

/**
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns total minted chambers count
 */
export const getChamberCount = (options: Options = {}): number => {
	const tokenIdToCoordView = getView(ViewName.tokenIdToCoord, options)
	return Object.keys(tokenIdToCoordView.data).length
}

/**
 ** @param tokenId the token id
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns the coordinates of the chamber
 */
export const getTokenCoords = (tokenId: number, options: Options = {}): ChamberCoords | null => {
	const tokenIdToCoordView = getView(ViewName.tokenIdToCoord, options) as ViewT<TokenIdToCoordsViewData>
	return tokenIdToCoordView.data[tokenId] ?? null
}

/**
 ** @param tokenIds the token ids
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns the coordinates of multiple chambers
 */
export const getTokensCoords = (tokenIds: number[], options: Options = {}): TokenIdToCoordsViewData => {
	const tokenIdToCoordView = getView(ViewName.tokenIdToCoord, options) as ViewT<TokenIdToCoordsViewData>
	return Object.entries(tokenIdToCoordView.data).reduce(function (result, [key, value]) {
		const tokenId = parseInt(key)
		if (tokenIds.includes(tokenId)) {
			result[tokenId] = value
		}
		return result
	}, {} as TokenIdToCoordsViewData)
}




//---------------------------
// ViewName.chamberData
//


/**
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns total static chambers count
 */
export const getStaticChamberCount = (options: Options = {}): number => {
	const chamberDataView = getView(ViewName.chamberData, options) as ViewT<ChamberDataViewData>
	return Object.values(chamberDataView.data).reduce(function (count, value) {
		return count + (value.isDynamic ? 0 : 1)
	}, 0)
}

/**
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
export const getDynamicChamberCount = (options: Options = {}): number => {
	const chamberDataView = getView(ViewName.chamberData, options) as ViewT<ChamberDataViewData>
	return Object.values(chamberDataView.data).reduce(function (result, value) {
		return result + (value.isDynamic ? 1 : 0)
	}, 0)
}

/**
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
export const getDynamicChambersCoord = (options: Options = {}): BigIntString[] => {
	const chamberDataView = getView(ViewName.chamberData, options) as ViewT<ChamberDataViewData>
	const tokenIdToCoordView = getView(ViewName.tokenIdToCoord, options) as ViewT<TokenIdToCoordsViewData>
	return Object.values(chamberDataView.data).reduce(function (result, value) {
		if (value.isDynamic) {
			result.push(tokenIdToCoordView.data[value.tokenId].coord)
		}
		return result
	}, [] as BigIntString[])
}
	
/**
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns total edge chambers count
 */
export const getDynamicChambersId = (options: Options = {}): number[] => {
	const chamberDataView = getView(ViewName.chamberData, options) as ViewT<ChamberDataViewData>
	return Object.values(chamberDataView.data).reduce(function (result, value) {
		if (value.isDynamic) {
			result.push(value.tokenId)
		}
		return result
	}, [] as number[])
}

/**
 ** @param coord chamber coordinate (bigint)
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns ChamberData of the chamber
 */
export const getChamberData = (coord: BigIntString, options: Options = {}): ChamberData | null => {
	const chamberDataView = getView(ViewName.chamberData, options) as ViewT<ChamberDataViewData>
	return chamberDataView.data[coord] ?? null
}

/**
 ** @param coords chambers coordinates (bigint)
 ** @param options.chainId the network chain id (1 or 5)
 ** @returns ChamberData of multiple chambers
 */
export const getChambersData = (coords: BigIntString[], options: Options = {}): ChamberDataViewData => {
	const chamberDataView = getView(ViewName.chamberData, options) as ViewT<ChamberDataViewData>
	return Object.entries(chamberDataView.data).reduce(function (result, [key, value]) {
		if (coords.includes(key)) {
			result[key] = value
		}
		return result
	}, {} as ChamberDataViewData)
}

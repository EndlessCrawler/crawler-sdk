import {
	ChainId,
	// Address,
	BNString,
	AllChambersViews,
	TokenIdToCoordsView,
	ChamberCoords,
	ChamberDataView,
	ChamberData,
} from './types'

import data_mainnet from '../data/mainnet/chambers.json'
import data_goerli from '../data/goerli/chambers.json'

const _data: Record<ChainId, AllChambersViews> = {
	[ChainId.Mainnet]: data_mainnet,
	[ChainId.Goerli]: data_goerli,
};

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns the full raw data of a network
 */
export const getAllChambersViews = (chainId: ChainId = ChainId.Mainnet): AllChambersViews => {
	return _data[chainId];
}

// export const getAddress = (chainId: ChainId): Address => {
// 	return data[chainId]?.address ?? null
// }

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns total minted chambers count
 */
export const getChamberCount = (chainId: ChainId = ChainId.Mainnet): number => {
	return Object.keys(_data[chainId]?.tokenIdToCoord ?? {}).length
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns all minted chambers coordinates, by token id
 */
export const getTokenIdToCoordsView = (chainId: ChainId = ChainId.Mainnet): TokenIdToCoordsView => {
	return _data[chainId]?.tokenIdToCoord ?? null
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @param tokenId the token id
 ** @returns the coordinates of the chamber
 */
export const getTokenIdToCoords = (tokenId: number, chainId: ChainId = ChainId.Mainnet): ChamberCoords => {
	const _view: TokenIdToCoordsView = _data[chainId]?.tokenIdToCoord
	return _view?.[tokenId] ?? null
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @returns all minted chambers data, by {Coord} (BN)
 */
export const getChamberDataView = (chainId: ChainId = ChainId.Mainnet): ChamberDataView => {
	return _data[chainId]?.chamberData ?? null
}

/**
 ** @param chainId the network chain id (1 or 5)
 ** @param coord chamber coordinate (BN)
 */
export const getChamberData = (coord: BNString, chainId: ChainId = ChainId.Mainnet): ChamberData => {
	const _view: ChamberDataView = _data[chainId]?.chamberData
	return _view?.[coord] ?? null
}


import {
	ChainId,
	NetworkName,
	ChainIdToNetworkName,
	NetworkNameToChainId,
} from '../types'

/** @returns all supported chain ids */
export const getAllChainIds = (): ChainId[] => {
	return Object.keys(ChainIdToNetworkName).map(v => Number(v)) as ChainId[]
}

/** @returns all supported network names */
export const getAllNetworkNames = (): NetworkName[] => {
	return Object.keys(NetworkNameToChainId) as NetworkName[]
}

/** @returns the network nake from a chain id */
export const chainIdToNetworkName = (chainId: ChainId): NetworkName => {
	return ChainIdToNetworkName[chainId]
}

/** @returns chaion id from a network name */
export const networkNameToChainId = (networkName: NetworkName): ChainId => {
	return NetworkNameToChainId[networkName]
}

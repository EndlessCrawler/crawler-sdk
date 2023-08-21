import {
	ChainId,
	NetworkName,
	ContractName,
	Address,
	ChainIdToNetworkName,
	NetworkNameToChainId,
	ContractAddresses,
	ContractsView,
	InvalidCrawlerChainError,
	InvalidCrawlerContractError,
} from '../types'

// import data
import contractsByChain from '../../data/contracts.json'


/** @returns all supported chain ids */
export const getAllChainIds = (): ChainId[] => {
	return Object.keys(ChainIdToNetworkName).map(v => Number(v)) as ChainId[]
}

/** @returns all supported network names */
export const getAllNetworkNames = (): NetworkName[] => {
	return Object.keys(NetworkNameToChainId) as NetworkName[]
}

/**
 ** @param chainId the network chain id
 ** @returns total minted chambers count
 */
export const getChainContractAddresses = (chainId: ChainId): ContractAddresses => {
	const view: ContractsView = contractsByChain
	if (!view[chainId]) {
		throw new InvalidCrawlerChainError(chainId)
	}
	return view[chainId]
}

/**
 ** @param contractName the contract name
 ** @param chainId the network chain id
 ** @returns total minted chambers count
 */
export const getContractAddress = (contractName: ContractName, chainId: ChainId): Address => {
	const contracts = getChainContractAddresses(chainId)
	if (!contracts[contractName]) {
		throw new InvalidCrawlerContractError(contractName)
	}
	return contracts[contractName]
}

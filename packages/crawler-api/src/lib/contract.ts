import {
	Address,
	ChainId,
	ContractName,
	resolveChainId,
	InvalidCrawlerChainError,
} from '@avante/crawler-data'
import {
	ContractInfo,
	ContractAbi,
	ErrorResult,
	InvalidCrawlerContractError,
} from './types'

import { Contracts } from './abis'


/** @returns All supported contract names */
export const getAllContractNames = (): ContractName[] => {
	return Object.keys(Contracts) as ContractName[]
}

/**
 ** @param contractName the contract name
 ** @param chainId the network chain id
 ** @returns a contract's address for the specified chain
 */
export const getContractAddress = (contractName: ContractName, chainId: ChainId): Address => {
	if (!Contracts[contractName]) {
		throw new InvalidCrawlerContractError(contractName)
	}
	const result = Contracts[contractName].networks[chainId] ?? null
	if (!result) {
		throw new InvalidCrawlerChainError(chainId)
	}
	return result
}

/** @returns a contract's abi and address for the specified chain */
export const getContractAbi = (options: ContractInfo): ContractAbi => {
	const chainId = resolveChainId(options)
	let { contractName, contractAddress } = options

	if (!Contracts[contractName]) {
		throw new InvalidCrawlerContractError(contractName)
	}
	const abi = Contracts[contractName].abi

	if (!contractAddress) {
		contractAddress = getContractAddress(contractName, chainId)
	}

	return { chainId, contractAddress, abi }
}

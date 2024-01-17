import {
	Address,
	ChainId,
	ContractName,
	InvalidCrawlerChainError,
} from '@avante/crawler-core'
import {
	InvalidCrawlerContractError,
} from './types'

import { Contracts } from './abis'


/** @returns All supported contract names */
export const getAllContractNames = (): ContractName[] => {
	return Object.keys(Contracts) as ContractName[]
}

/** @returns a contract's address for the specified chain */
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

/** @returns a contract's abi for the specified chain */
export const getContractAbi = (contractName: ContractName): any => {
	if (!Contracts[contractName]) {
		throw new InvalidCrawlerContractError(contractName)
	}
	return Contracts[contractName].abi
}

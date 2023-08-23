import {
	ContractInfo,
	ContractAbi,
	ErrorResult,
} from '../types'

import { Contracts } from './abis'

export const getContract = (options: ContractInfo): ContractAbi | ErrorResult => {
	let { contractName, contractAddress, chainId } = options

	if (!contractName) {
		return {
			error: `Missing contractName`
		}
	}

	if (!chainId) {
		chainId = 1
	}

	const abi = Contracts[contractName]?.abi ?? null
	if (!abi) {
		return {
			error: `Bad contractName`
		}
	}

	if (!contractAddress) {
		contractAddress = Contracts[contractName]?.networks?.[chainId] ?? null
		if (!contractAddress) {
			return {
				error: `Bad chainId`
			}
		}
	}

	return { chainId, contractAddress, abi }
}

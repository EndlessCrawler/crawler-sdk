import { getContractAbi } from './contract'
import { readContract } from './wagmi'
import {
	Options,
	ViewName,
	resolveChainId,
} from '@avante/crawler-data'
import {
	ContractAbi,
	ContractInfo,
	ViewDefinition,
	isErrorResult,
} from './types'

import tokenIdToCoord from './views/tokenIdToCoord'
import chamberData from './views/chamberData'

const views: Record<ViewName, ViewDefinition> = {
	[ViewName.tokenIdToCoord]: tokenIdToCoord(),
	[ViewName.chamberData]: chamberData(),
}



export const readViewRecord = async (viewName: ViewName, key: any, args: any[], options: ContractInfo) => {
	const view = views[viewName]
	if (!view) {
		return {
			error: `View not found [${viewName}]`,
		}
	}
	const { contractName, functionName, transform } = view

	// Get contract
	const chainId = resolveChainId(options)
	const contract = getContractAbi({
		...options,
		chainId,
		contractName,
	})
	// console.log(`contract:`, contractName, contract.contractAddress)

	if (isErrorResult(contract)) {
		return {
			error: contract.error,
		}
	}

	const { data, error } = await readContract(contract as ContractAbi, functionName, args)

	if (error) {
		return { error }
	}

	return {
		data: {
			[key]: transform?.(data) ?? data
		}
	}
}

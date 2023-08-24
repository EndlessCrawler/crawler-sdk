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
	DataResult,
	ErrorResult,
	ViewDefinition,
	isErrorResult,
} from './types'

import tokenIdToCoord from './views/tokenIdToCoord'
import chamberData from './views/chamberData'

const views: Record<ViewName, ViewDefinition> = {
	[ViewName.tokenIdToCoord]: tokenIdToCoord(),
	[ViewName.chamberData]: chamberData(),
}

//----------------------------------
// read a View record on-chain
//
export const readViewRecord = async (viewName: ViewName, key: any, args: any[], options: ContractInfo): Promise<DataResult | ErrorResult> => {
	const chainId = resolveChainId(options)

	const view = views[viewName]
	const { contractName, functionName, transform } = view

	const contract = getContractAbi({
		...options,
		chainId,
		contractName,
	})

	if (isErrorResult(contract)) {
		return contract
	}

	const result = await readContract(contract as ContractAbi, functionName, args)
	if (isErrorResult(result)) {
		return result
	}

	return {
		data: {
			[key]: await transform?.(result.data) ?? result.data
		}
	}
}

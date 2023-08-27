import { readContractOrThrow } from './wagmi'
import {
	ViewName,
} from '@avante/crawler-data'
import {
	ReadViewOptions,
	ReadViewResult,
	ViewDefinition,
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
export const readViewRecordOrThrow = async (options: ReadViewOptions): Promise<ReadViewResult> => {
	const { viewName, key } = options
	const view = views[viewName]
	const { contractName, functionName, transform } = view

	const readContractOptions = {
		...options,
		contractName,
		functionName,
	}

	// will throw on contract error
	const result = await readContractOrThrow(readContractOptions)

	return {
		[key]: await transform?.(result) ?? result
	}
}

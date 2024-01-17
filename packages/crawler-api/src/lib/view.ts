import { readContractOrThrow } from './wagmi'
import {
	ViewName,
	Options,
} from '@avante/crawler-core'
import {
	ReadContractOptions,
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
	const { contractName, functionName, keyToArgs, transform } = view

	const args = keyToArgs(key)

	const readContractOptions: ReadContractOptions = {
		...options, // copy chainId
		contractName,
		functionName,
		args,
	}

	// will throw on contract error
	console.log(`readContractOptions:`, readContractOptions)
	const result = await readContractOrThrow(readContractOptions)

	return {
		[key]: await transform?.(result) ?? result
	}
}

export const readViewTotalCount = async (viewName: ViewName, options: Options): Promise<number> => {
	const view = views[viewName]
	return view.readTotalCount(options)
}


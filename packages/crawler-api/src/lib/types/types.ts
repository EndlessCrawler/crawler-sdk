import {
	ChainId,
	ContractName,
	Address,
	Options,
	ViewName,
} from '@avante/crawler-data'

/** @type contract address and abi for on-chain calls */
export interface ContractArtifacts {
	abi: any
	networks: any
}

/** @type passed to readViewRecordOrThrow() for on-chain read */
export interface ReadViewOptions extends Options {
	chainId?: ChainId  // from Options
	viewName: ViewName,
	key: any,
	args: any[],
}

/** @type result from readViewRecordOrThrow() */
export interface ReadViewResult {
	[key: string]: any
}

/** @type passed to readContract() for on-chain read */
export interface ReadContractOptions extends Options {
	chainId?: ChainId  // from Options
	contractName: ContractName,
	functionName: string,
	args: any[],
}

/** @type generic error result from functions */
export interface ErrorResult {
	error: string
}

/** @type generic data result from functions */
export interface DataResult {
	data: any
}

/** @type check if a function result is ErrorResult */
export function isErrorResult(instance: any): instance is ErrorResult {
	return instance && instance.error && typeof (instance.error) == 'string'
}

/** @type check if a function result is DataResult */
export function isDataResult(instance: any): instance is DataResult {
	return instance && instance.data && typeof (instance.data) == 'string'
}

/** @type view definition for on-chain fetch */
export interface ViewDefinition {
	contractName: ContractName
	functionName: string
	getTotalCount: any
	transform: any
}

/** @type view definition for on-chain fetch */
export interface ViewDefinitionT<T> extends ViewDefinition {
	getTotalCount: () => Promise<number>
	transform: (data: any) => Promise<T>
}

import {
	ChainId,
	Address,
	Options,
} from '@avante/crawler-data'

/** @type included contract names */
export enum ContractName {
	CrawlerToken = 'CrawlerToken',
	// CrawlerIndex = 'CrawlerIndex',
	// CrawlerPlayer = 'CrawlerPlayer',
	// CrawlerQueryV1 = 'CrawlerQueryV1',
	// LimboToken = 'LimboToken',
	// // Cards
	// CardsMinter = 'CardsMinter',
	// FounderStoreV2 = 'FounderStoreV2',
	// // Interfaces
	// IERC721 = 'IERC721',
	// ICardsStore = 'ICardsStore',
	// ICrawlerContract = 'ICrawlerContract',
	// ICrawlerMapper = 'ICrawlerMapper',
	// Ownable = 'Ownable',
}

/** @type contract address and abi for on-chain calls */
export interface ContractArtifacts {
	abi: any
	networks: any
}

/** @type passed to getContract() */
export interface ContractInfo extends Options {
	chainId: ChainId // from Options
	contractName: ContractName
	contractAddress?: Address
}

/** @type result from getContract() */
export interface ContractAbi extends Options {
	chainId: ChainId // from Options
	contractAddress: Address,
	abi: any
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

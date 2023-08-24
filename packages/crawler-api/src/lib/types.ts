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

/** @type check if a function result is ErrorResult */
export function isErrorResult(obj: any): obj is ErrorResult {
	return obj && obj.error && typeof (obj.error) == 'string'
}

/** @type view definition for on-chain fetch */
export interface ViewDefinition {
	contractName: ContractName
	functionName: string,
	transform: (data: any) => any
}

/** @type view definition for on-chain fetch */
export interface ViewDefinitionT<T> extends ViewDefinition {
	transform: (data: any) => T
}

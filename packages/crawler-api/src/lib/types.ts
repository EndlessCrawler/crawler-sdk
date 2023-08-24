import {
	ChainId,
	Address,
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
export interface ContractInfo {
	chainId: ChainId
	contractName: ContractName
	contractAddress?: Address
}

/** @type result from getContract() */
export interface ContractAbi {
	chainId: ChainId,
	contractAddress: Address,
	abi: any
}

/** @type generic error result from functions */
export interface ErrorResult {
	error: string
}

export function isErrorResult(obj: any): obj is ErrorResult {
	return obj && obj.error && typeof (obj.error) == 'string'
}

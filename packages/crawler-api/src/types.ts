import {
	ChainId,
	Address,
} from '@avante/crawler-data'

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

export interface ContractArtifacts {
	abi: any
	networks: any
}

/** passed to getContract() */
export interface ContractInfo {
	chainId: ChainId
	contractName: ContractName
	contractAddress?: Address
}

/** result from getContract() */
export interface ContractAbi {
	chainId: ChainId,
	contractAddress: Address,
	abi: any
}

export interface ErrorResult {
	error: string
}
export function isErrorResult(obj: any): obj is ErrorResult {
	return obj && obj.error && typeof (obj.error) == 'string'
}

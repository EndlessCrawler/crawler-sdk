/** @type supported networks */
export enum NetworkName {
	Blank = 'blank',
	Mainnet = 'mainnet',
	Goerli = 'goerli',
	// Sepolia = 'sepolia',
}

/** @type supported chain ids */
export enum ChainId {
	Blank = 0,
	Mainnet = 1,
	Goerli = 5,
	// Sepolia = 11155111,
}
export type ChainIdOrNone = ChainId | 0

/** @type chain id to network name lookup */
export const ChainIdToNetworkName: Record<ChainId, NetworkName> = {
	[ChainId.Blank]: NetworkName.Blank,
	[ChainId.Mainnet]: NetworkName.Mainnet,
	[ChainId.Goerli]: NetworkName.Goerli,
	// [ChainId.Sepolia]: NetworkName.Sepolia,
}

/** @type chain id to network name lookup */
export const NetworkNameToChainId: Record<NetworkName, ChainId> = {
	[NetworkName.Blank]: ChainId.Blank,
	[NetworkName.Mainnet]: ChainId.Mainnet,
	[NetworkName.Goerli]: ChainId.Goerli,
	// [NetworkName.Sepolia]: ChainId.Sepolia,
}

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



/** @type supported networks */
export enum NetworkName {
	Mainnet = 'mainnet',
	Goerli = 'goerli',
	// Sepolia = 'sepolia',
}

/** @type supported chain ids */
export enum ChainId {
	Mainnet = 1,
	Goerli = 5,
	// Sepolia = 11155111,
}

/** @type chain id to network name lookup */
export const ChainIdToNetworkName: Record<ChainId, NetworkName> = {
	[ChainId.Mainnet]: NetworkName.Mainnet,
	[ChainId.Goerli]: NetworkName.Goerli,
	// [ChainId.Sepolia]: NetworkName.Sepolia,
}

/** @type chain id to network name lookup */
export const NetworkNameToChainId: Record<NetworkName, ChainId> = {
	[NetworkName.Mainnet]: ChainId.Mainnet,
	[NetworkName.Goerli]: ChainId.Goerli,
	// [NetworkName.Sepolia]: ChainId.Sepolia,
}

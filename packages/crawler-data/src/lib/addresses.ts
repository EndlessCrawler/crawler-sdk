import addresses from '../data/addresses.json'
import {
	ChainId,
	ContractAddresses,
	NetworkName,
} from './types'

/**
 * Get addresses of contracts that have been deployed to the
 * Ethereum mainnet or a supported testnet. Throws if there are
 * no known contracts deployed on the corresponding chain.
 * @param chainId The desired chainId
 */
export const getContractAddressesForChainOrThrow = (chainId: ChainId | NetworkName): ContractAddresses => {
	const _addresses: Record<string, ContractAddresses> = addresses
	if (!_addresses[chainId]) {
		throw new Error(`getContractAddressesForChainOrThrow(${chainId}): Unknown chain id.`)
	}
	return _addresses[chainId]
}

import Contracts from '@/contracts/Contracts'

export const getContract = ({ contractName, contractAddress, chainId }) => {

	if (!contractName) {
		return {
			error: `Missing contractName`
		}
	}

	if (!chainId) {
		chainId = 1
	}

	const abi = Contracts[contractName]?.abi ?? null
	if (!abi) {
		return {
			error: `Bad contractName`
		}
	}

	if (!contractAddress) {
		contractAddress = Contracts[contractName]?.networks?.[chainId] ?? null
		if (!contractAddress) {
			return {
				error: `Bad chainId`
			}
		}
	}

	return { chainId, contractAddress, abi }
}


import { getContract } from '@/api/contract'
import { readContract } from '@/api/wagmi'

const views = {
	tokenIdToCoord: {
		contractName: 'CrawlerToken',
		functionName: 'tokenIdToCoord',
		argsNames: ['tokenId'],
		transform: (coord) => {
			// TODO: Fetch Compass, slug
			return {
				coord,
			}
		},
	},
}

export const getView = async (viewName, query) => {
	const view = views[viewName]
	if (!view) {
		return {
			error: `View not found [${viewName}]`,
		}
	}
	const { contractName, functionName, argsNames, transform } = view

	const args = argsNames.map(argName => query[argName]);

	// Get contract
	const contract = getContract({
		...query,
		contractName,
	})
	// console.log(`contract:`, contractName, contract.contractAddress)

	if (contract.error) {
		return {
			error: contract.error,
		}
	}

	const { data, error } = await readContract(contract, functionName, args)

	if (error) {
		return { error }
	}

	return {
		data: transform?.(data) ?? data
	}
}


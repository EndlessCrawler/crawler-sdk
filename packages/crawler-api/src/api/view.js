import { getContract } from './contract'
import { wagmiReadContract } from './wagmi'
import { Compass, Types as T } from '@avante/crawler-data'

const views = {
	[T.ViewName.tokenIdToCoord]: {
		contractName: 'CrawlerToken',
		functionName: 'tokenIdToCoord',
		keyName: 'tokenId',
		argsNames: ['tokenId'],
		transform: (coord) => {
			const compass = Compass.fromBN(coord)
			return {
				coord,
				slug: Compass.toSlug(compass),
				compass: Compass.minify(compass),
			}
		},
	},
}

//
//	query  {
//		chainId:
//		arg1: value,
//		argX: value,
//
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

	const { data, error } = await wagmiReadContract(contract, functionName, args)

	if (error) {
		return { error }
	}

	const key = query[view.keyName]
	return {
		data: {
			[key]: transform?.(data) ?? data
		}
	}
}


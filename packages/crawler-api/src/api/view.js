import { getContract } from './contract'
import { wagmiReadContract } from './wagmi'
import { Compass, Types as T } from '@avante/crawler-data'
const { ethers } = require('ethers')
const BN = require('bn.js');

const views = {
	[T.ViewName.tokenIdToCoord]: {
		contractName: 'CrawlerToken',
		functionName: 'tokenIdToCoord',
		transform: (coord) => {
			const compass = Compass.fromBN(coord)
			return {
				coord,
				slug: Compass.toSlug(compass),
				compass: Compass.minify(compass),
			}
		},
	},
	[T.ViewName.chamberData]: {
		contractName: 'CrawlerToken',
		functionName: 'coordToChamberData',
		transform: (data) => {
			if (data && parseInt(data.tokenId) > 0) {
				console.log(data)
				const locks = data.locks.map((v) => v != 0);
				const locksCount = locks.reduce(function (n, val) { return n + (val ? 1 : 0); }, 0);
				const chamberData = {
					compass: Compass.fromBN(data.coord),
					coord: data.coord,
					seed: `0x${new BN(data.seed).toJSON()}`,
					bitmap: data.bitmap != '0' ? `0x${new BN(data.bitmap).toJSON()}` : undefined,
					tilemap: data.tilemap != '0x' ? Object.values(ethers.utils.arrayify(data.tilemap)) : undefined,
					tokenId: parseInt(data.tokenId),
					yonder: parseInt(data.yonder),
					name: data.name ?? `Chamber #${data.tokenId}`,
					chapter: data.chapter,
					terrain: data.terrain,
					entryDir: data.entryDir,
					gemPos: data.gemPos,
					gemType: data.hoard.gemType,
					coins: data.hoard.coins,
					worth: data.hoard.worth,
					doors: data.doors,
					locks,
					isStatic: (locksCount == 0),
				}
				return chamberData;
			}
			return {}
		},
	},
}

//
//	options  {
//		chainId:
//
export const getView = async (viewName, key, args, options) => {
	const view = views[viewName]
	if (!view) {
		return {
			error: `View not found [${viewName}]`,
		}
	}
	const { contractName, functionName, argsNames, transform } = view

	// Get contract
	const contract = getContract({
		...options,
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

	return {
		data: {
			[key]: transform?.(data) ?? data
		}
	}
}


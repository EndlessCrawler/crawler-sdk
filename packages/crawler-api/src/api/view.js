import { getContract } from './contract'
import { readContract } from './wagmi'
import {
	compassToSlug,
	coordToCompass,
	minifyCompas,
	bigIntToHexString,
	bigIntToNumberArray,
	ViewName,
 } from '@avante/crawler-data'

const views = {
	[ViewName.tokenIdToCoord]: {
		contractName: 'CrawlerToken',
		functionName: 'tokenIdToCoord',
		transform: (coord) => {
			const compass = coordToCompass(coord)
			return {
				coord,
				slug: compassToSlug(compass),
				compass: minifyCompas(compass),
			}
		},
	},
	[ViewName.chamberData]: {
		contractName: 'CrawlerToken',
		functionName: 'coordToChamberData',
		transform: (data) => {
			if (data && parseInt(data.tokenId) > 0) {
				console.log(data)
				const locks = data.locks.map((v) => v != 0);
				const locksCount = locks.reduce(function (n, val) { return n + (val ? 1 : 0); }, 0);
				const chamberData = {
					compass: coordToCompass(data.coord),
					coord: data.coord,
					seed: bigIntToHexString(data.seed),
					bitmap: data.bitmap != '0' ? bigIntToHexString(data.bitmap) : undefined,
					tilemap: data.tilemap != '0x' ? bigIntToNumberArray(data.tilemap) : undefined,
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

	const { data, error } = await readContract(contract, functionName, args)

	if (error) {
		return { error }
	}

	return {
		data: {
			[key]: transform?.(data) ?? data
		}
	}
}


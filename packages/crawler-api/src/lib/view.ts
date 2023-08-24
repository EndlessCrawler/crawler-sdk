import { getContractAbi } from './contract'
import { readContract } from './wagmi'
import {
	compassToSlug,
	coordToCompass,
	minifyCompas,
	bigIntToHexString,
	bigIntToNumberArray,
	ViewName,
	Compass,
	ChamberCoords,
	ChamberData,
} from '@avante/crawler-data'
import {
	ContractAbi,
	isErrorResult,
} from './types'

const views = {
	[ViewName.tokenIdToCoord]: {
		contractName: 'CrawlerToken',
		functionName: 'tokenIdToCoord',
		transform: (coord: bigint): ChamberCoords => {
			const compass = coordToCompass(coord)
			return {
				coord: coord.toString(),
				slug: compassToSlug(compass) as string,
				compass: minifyCompas(compass) as Compass,
			}
		},
	},
	[ViewName.chamberData]: {
		contractName: 'CrawlerToken',
		functionName: 'coordToChamberData',
		transform: (data: any): ChamberData => {
			console.log(data)
			const locks = data.locks.map((v: number) => v != 0)
			const locksCount = locks.reduce((result: number, val: number) => { return result + (val ? 1 : 0) }, 0)
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
			} as ChamberData
			return chamberData
		},
	},
}

//
//	options  {
//		chainId:
//
export const readViewRecord = async (viewName: ViewName, key: any, args: any[], options: any) => {
	const view = views[viewName]
	if (!view) {
		return {
			error: `View not found [${viewName}]`,
		}
	}
	const { contractName, functionName, transform } = view

	// Get contract
	const contract = getContractAbi({
		...options,
		contractName,
	})
	// console.log(`contract:`, contractName, contract.contractAddress)

	if (isErrorResult(contract)) {
		return {
			error: contract.error,
		}
	}

	const { data, error } = await readContract(contract as ContractAbi, functionName, args)

	if (error) {
		return { error }
	}

	return {
		data: {
			[key]: transform?.(data) ?? data
		}
	}
}

import {
	ViewDefinitionT,
	ContractName,
} from '../types'
import {
	ChamberCoords,
	compassToSlug,
	coordToCompass,
	minifyCompas,
	Compass,
} from '@avante/crawler-data'

export default (): ViewDefinitionT<ChamberCoords> => ({
	//
	// View info
	contractName: ContractName.CrawlerToken,
	functionName: 'tokenIdToCoord',

	//
	// updated number of total records
	getTotalCount: async (): Promise<number> => {
		///@ts-ignore
		return 0
	},

	//
	// transform fetched data to View
	transform: async (coord: bigint): Promise<ChamberCoords> => {
		const compass = coordToCompass(coord)
		return {
			coord: coord.toString(),
			slug: compassToSlug(compass) as string,
			compass: minifyCompas(compass) as Compass,
		}
	}
})

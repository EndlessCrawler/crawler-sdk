import {
	ChamberCoords,
	compassToSlug,
	coordToCompass,
	minifyCompas,
	Compass,
	ContractName,
	Options,
} from '@avante/crawler-data'
import {
	ViewDefinitionT,
} from '../types'
import {
	readTotalSupply,
} from '../calls'

export default (): ViewDefinitionT<ChamberCoords> => ({
	//
	// View info
	// function tokenIdToCoord(uint256 tokenId) public view override returns (uint256)
	contractName: ContractName.CrawlerToken,
	functionName: 'tokenIdToCoord',

	//
	// updated number of total records
	readTotalCount: async (options: Options): Promise<number> => {
		return readTotalSupply(ContractName.CrawlerToken, options)
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

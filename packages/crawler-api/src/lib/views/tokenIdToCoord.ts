import {
	createClient,
	EndlessCrawler,
	ChamberCoords,
	ContractName,
	Options,
} from '@avante/crawler-core'
import {
	ViewDefinitionT,
} from '../types'
import {
	readTotalSupply,
} from '../calls'

const client = createClient(EndlessCrawler.Id) as EndlessCrawler.Module
type Compass = EndlessCrawler.Compass

export default (): ViewDefinitionT<ChamberCoords> => ({
	//
	// View info
	// function tokenIdToCoord(uint256 tokenId) public view override returns (uint256)
	contractName: ContractName.CrawlerToken,
	functionName: 'tokenIdToCoord',

	keyToArgs: (key: any): any[] => {
		return [key.toString()]
	},

	//
	// updated number of total records
	readTotalCount: async (options: Options): Promise<number> => {
		return readTotalSupply(ContractName.CrawlerToken, options)
	},

	//
	// transform fetched data to View
	transform: async (coord: bigint): Promise<ChamberCoords> => {
		const compass = client.coordToCompass(coord)
		return {
			coord: coord.toString(),
			slug: client.compassToSlug(compass) as string,
			compass: client.minifyCompass(compass) as Compass,
		}
	}
})

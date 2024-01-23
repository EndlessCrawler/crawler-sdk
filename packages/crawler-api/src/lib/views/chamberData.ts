import {
	createClient,
	EndlessCrawler,
	ChamberData,
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

export default (): ViewDefinitionT<ChamberData> => ({
	//
	// View info
	// function coordToChamberData(uint8 chapterNumber, uint256 coord, bool generateMaps) public view override returns (Crawl.ChamberData memory result)
	contractName: ContractName.CrawlerToken,
	functionName: 'coordToChamberData',

	keyToArgs: (key: any): any[] => {
		return [0, key, true]
	},

	//
	// updated number of total records
	readTotalCount: async (options: Options): Promise<number> => {
		return readTotalSupply(ContractName.CrawlerToken, options)
	},

	//
	// transform fetched data to View
	transform: async (data: any): Promise<ChamberData> => {
		return client.chamberData.transform(data)
	}
})

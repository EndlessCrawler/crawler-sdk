import {
	ChamberData,
	ContractName,
	coordToCompass,
	minifyCompas,
	bigIntToHexString,
	bigIntToNumberArray,
	Options,
	Compass,
} from '@avante/crawler-data'
import {
	ViewDefinitionT,
} from '../types'
import {
	readTotalSupply,
} from '../calls'

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
		console.log(data)
		const locks = data.locks.map((v: number) => v != 0)
		const locksCount = locks.reduce((result: number, val: number) => { return result + (val ? 1 : 0) }, 0)
		const chamberData: ChamberData = {
			compass: minifyCompas(coordToCompass(data.coord)) as Compass,
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
			locksCount,
			isDynamic: (locksCount > 0),
		}
		return chamberData
	}
})

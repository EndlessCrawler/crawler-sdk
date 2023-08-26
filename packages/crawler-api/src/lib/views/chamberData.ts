import {
	ViewDefinitionT,
} from '../types'
import {
	ChamberData,
	ContractName,
	coordToCompass,
	bigIntToHexString,
	bigIntToNumberArray,
} from '@avante/crawler-data'

export default (): ViewDefinitionT<ChamberData> => ({
	//
	// View info
	contractName: ContractName.CrawlerToken,
	functionName: 'coordToChamberData',

	//
	// updated number of total records
	getTotalCount: async (): Promise<number> => {
		///@ts-ignore
		return 0
	},

	//
	// transform fetched data to View
	transform: async (data: any): Promise<ChamberData> => {
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
	}
})

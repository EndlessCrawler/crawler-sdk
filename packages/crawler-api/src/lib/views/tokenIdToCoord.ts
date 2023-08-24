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
	contractName: ContractName.CrawlerToken,
	functionName: 'tokenIdToCoord',
	transform: (coord: bigint): ChamberCoords => {
		const compass = coordToCompass(coord)
		return {
			coord: coord.toString(),
			slug: compassToSlug(compass) as string,
			compass: minifyCompas(compass) as Compass,
		}
	}
})

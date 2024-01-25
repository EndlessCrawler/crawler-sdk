import { useMemo } from 'react'
import {
	BigIntIsh,
	ChamberData,
	ModuleInterface,
	Utils,
} from '@avante/crawler-core'
import { useCrawler } from './useCrawler'

export const useChamberData = <T extends ModuleInterface>(coord: BigIntIsh): {
	chamberData: ChamberData | null
} => {
	const { client } = useCrawler<T>()
	const chamberData = useMemo(() => {
		return client.chamberData.get(Utils.toBigInt(coord))
	}, [coord])
	return {
		chamberData
	}
}

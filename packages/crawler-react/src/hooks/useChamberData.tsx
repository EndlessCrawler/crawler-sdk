import { useEffect, useMemo, useState } from 'react'
import {
	BigIntIsh,
	ChamberData,
	EventName,
	ModuleInterface,
	Utils,
} from '@avante/crawler-core'
import { useCrawler } from './useCrawler'
import { useEvent } from './misc/useEvent'


export const useChamberData = <T extends ModuleInterface>(coord: BigIntIsh): ChamberData | null => {
	const { client } = useCrawler<T>()
	const [chamberData, setChamberData] = useState<ChamberData | null>(null)

	// const chamberData = useMemo(() => {
	// 	return client.chamberData.get(Utils.toBigInt(coord))
	// }, [coord])

	useEffect(() => {
		_refresh()
	}, [coord])

	useEvent(EventName.ViewRecordChanged, (data: any) => {
		// TODO: should be checking not just key, but module/dataset/view/key
		if (Utils.bigIntEquals(data.coord, coord)) {
			_refresh()
		}
	})

	const _refresh = () => {
		setChamberData(client.chamberData.get(Utils.toBigInt(coord)))
	}

	return chamberData
}

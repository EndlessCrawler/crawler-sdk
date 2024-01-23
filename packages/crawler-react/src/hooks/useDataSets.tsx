import { useState } from 'react'
import { DataSetName, EventName } from '@avante/crawler-core'
import { useCrawler } from './useCrawler'
import { useEvent } from './useEvent'

export const useDataSets = () => {
	const { client } = useCrawler()
	
	const [dataSetNames, setDataSetNames] = useState<DataSetName[]>([])
	const [currentDataSetName, setCurrentDataSetName] = useState<DataSetName | null>(null)

	useEvent(EventName.DataSetImported, (data: any) => {
		setDataSetNames(client.getDataSetNames())
	})

	useEvent(EventName.DataSetChanged, (data: any) => {
		setCurrentDataSetName(client.getCurrentDataSetName())
	})
	
	return {
		dataSetNames,
		currentDataSetName,
	}
}

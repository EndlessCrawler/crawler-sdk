import React, { useContext, useEffect, useState } from 'react'
import { CrawlerContext, CrawlerContextType } from '../context/CrawlerContext'
import { DataSetName, EndlessCrawler, EventName } from '@avante/crawler-core'
import { useCrawler } from './useCrawler'

export const useDataSets = () => {
	const { client } = useCrawler()
	const [dataSetNames, setDataSetNames] = useState<DataSetName[]>([])
	const [currentDataSetName, setCurrentDataSetName] = useState<DataSetName | null>(null)

	useEffect(() => {
		if (!client) return
		const _handler = (data: any) => {
			setDataSetNames(client.getDataSetNames())
		}
		document.addEventListener(EventName.DataSetImported, _handler)
		_handler({}) // initialize
		return () => {
			document.removeEventListener(EventName.DataSetImported, _handler)
		}
	}, [client])

	useEffect(() => {
		if (!client) return
		const _handler = (data: any) => {
			setCurrentDataSetName(client.getCurrentDataSetName())
		}
		document.addEventListener(EventName.DataSetChanged, _handler)
		_handler({}) // initialize
		return () => {
			document.removeEventListener(EventName.DataSetChanged, _handler)
		}
	}, [client])


	return {
		dataSetNames,
		currentDataSetName,
	}
}

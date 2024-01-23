import React, { useMemo } from 'react'
import { useCrawler, useDataSets } from '@avante/crawler-react'

export default function DataSetSelector() {
	const { client } = useCrawler()
	const { currentDataSetName, dataSetNames } = useDataSets()

	const _selectDataSet = (dataSetName: string) => {
		client.setCurrentDataSet({ dataSetName })
	}

	return (
		<div>
			dataset: <select value={(currentDataSetName ?? '') as string} onChange={(e) => _selectDataSet(e.target.value)}>
				{dataSetNames.map((dataSetName: string, index: number) => {
					return <option value={dataSetName} key={dataSetName}>{dataSetName}</option>
				})}
			</select>
		</div>
	)
}

import React, { useMemo } from 'react'
import { useCrawler } from '@avante/crawler-react'

export default function DataSetSelector() {
	const { client } = useCrawler()

	const dataSetNames = useMemo(() => {
		return client.getDataSetNames()
	}, [client])

	const _selectDataSet = (dataSetName: string) => {
		client.setCurrentDataSet({ dataSetName })
	}

	return (
		<div>
			<select onChange={(e) => _selectDataSet(e.target.value)}>
				{dataSetNames.map((dataSetName: string, index: number) => {
					return <option value={dataSetName} key={dataSetName}>{dataSetName}</option>
				})}
			</select>
		</div>
	)
}

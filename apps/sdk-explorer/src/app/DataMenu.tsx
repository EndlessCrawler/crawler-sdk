import React, { useMemo } from 'react'
import { Divider } from 'semantic-ui-react'
import { ActionDispatcher } from '@/components/Dispatchers'
import { useCrawler, useDataSets } from '@avante/crawler-react'

export default function DataMenu() {
	const { client } = useCrawler()
	const { currentDataSetName } = useDataSets()

	const views = useMemo(() => {
		let result = []
		for (const viewName of client.getViewNames()) {
			//@ts-ignore
			const view = client.getView(viewName)
			const count = Object.keys(view.records).length
			result.push(
				<div key={viewName} >
					<Divider hidden />
					{`>`} {viewName} [{count}]
					<div>
						&nbsp;&nbsp;<ActionDispatcher label='getView()' onAction={() => client.getView(viewName)} />
						&nbsp;&nbsp;<ActionDispatcher label='getViewRecordCount()' onAction={() => client.getViewRecordCount(viewName)} />
					</div>
				</div>
			)
		}
		return result
	}, [client])

	// Chambers
	const chamberCount = client.chamberData.getCount()
	const dynamicIds = useMemo(() => client.chamberData.getDynamicChambersIds(), [client])
	const dynamicCoord = useMemo(() => client.chamberData.getDynamicChambersCoords(), [client])
	const tokenCoords_1 = useMemo(() => client.tokenIdToCoord.get(1), [client])
	const tokenCoords_n = useMemo(() => client.tokenIdToCoord.get(chamberCount), [client])

	return (
		<div>
			<Divider />

			<h4>DataSets</h4>
			<div>
				<ActionDispatcher label='getDataSetNames()' onAction={() => client.getDataSetNames()} />
				<ActionDispatcher label='getCurrentDataSetName()' onAction={() => client.getCurrentDataSetName()} />
				<ActionDispatcher label={`getDataSet(~${currentDataSetName})`} onAction={() => client.getDataSet()} />
				<ActionDispatcher label='createBlankDataSet()' onAction={() => client.createBlankDataSet()} />
			</div>

			<Divider />

			<h4>Views</h4>
			<div>
				<ActionDispatcher label='getViewNames()' onAction={() => client.getViewNames()} />
				<ActionDispatcher label={`getAllViews(~${currentDataSetName})`} onAction={() => client.getAllViews()} />
				{views}
			</div>

			<Divider />

			<h4>Tokens</h4>
			<div>
				<ActionDispatcher label='tokenIdToCoord.get(1)' onAction={() => client.tokenIdToCoord.get(1)} />
				<ActionDispatcher label={`tokenIdToCoord.get(${chamberCount})`} onAction={() => client.tokenIdToCoord.get(chamberCount)} />
				<ActionDispatcher label='tokenIdToCoord.getTokensCoords(dynamic)' onAction={() => client.tokenIdToCoord.getTokensCoords(dynamicIds)} />
			</div>

			<Divider />

			<h4>Chambers</h4>
			<div>
				<ActionDispatcher label='chamberData.getCount()' onAction={() => client.chamberData.getCount()} />
				<ActionDispatcher label={`chamberData.get(1)`} onAction={() => client.chamberData.get(tokenCoords_1?.coord ?? 0n)} />
				<ActionDispatcher label={`chamberData.get(${chamberCount})`} onAction={() => client.chamberData.get(tokenCoords_n?.coord ?? 0n)} />
				<ActionDispatcher label='chamberData.getMultiple(dynamic)' onAction={() => client.chamberData.getMultiple(dynamicCoord)} />
				<ActionDispatcher label='chamberData.getStaticChamberCount()' onAction={() => client.chamberData.getStaticChamberCount()} />
				<ActionDispatcher label='chamberData.getDynamicChamberCount()' onAction={() => client.chamberData.getDynamicChamberCount()} />
				<ActionDispatcher label='chamberData.getDynamicChambersIds()' onAction={() => client.chamberData.getDynamicChambersIds()} />
				<ActionDispatcher label='chamberData.getDynamicChambersCoords()' onAction={() => client.chamberData.getDynamicChambersCoords()} />
			</div>

		</div>
	)
}

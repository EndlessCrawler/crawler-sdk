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
			const count = Object.keys(view.data).length
			result.push(
				<div key={viewName} >
					<Divider hidden />
					{`>`} {viewName} [{count}]
					<div>
						&nbsp;&nbsp;<ActionDispatcher label='getView()' onAction={() => client.getView(viewName)} />
						&nbsp;&nbsp;<ActionDispatcher label='getViewDataCount()' onAction={() => client.getViewDataCount(viewName)} />
					</div>
				</div>
			)
		}
		return result
	}, [client])

	// Chambers
	const edgesIds = useMemo(() => client.chamberData.getDynamicChambersIds(), [client])
	const edgesCoord = useMemo(() => client.chamberData.getDynamicChambersCoords(), [client])
	const tokenCoords = useMemo(() => client.tokenIdToCoord.get(1), [client])

	return (
		<div>
			<Divider />

			<h4>DataSets</h4>
			<div>
				<ActionDispatcher label='getDataSetNames()' onAction={() => client.getDataSetNames()} />
				<ActionDispatcher label='getCurrentDataSetName()' onAction={() => client.getCurrentDataSetName()} />
				<ActionDispatcher label={`getDataSet(~${currentDataSetName})`} onAction={() => client.getDataSet()} />
			</div>

			<Divider />

			<h4>Views</h4>
			<div>
				<ActionDispatcher label='getViewNames()' onAction={() => client.getViewNames()} />
				<ActionDispatcher label={`getAllViews(~${currentDataSetName})`} onAction={() => client.getAllViews()} />
				{views}
			</div>

			<Divider />

			<h4>Chambers</h4>
			<div>
				<ActionDispatcher label='chamberData.getCount()' onAction={() => client.chamberData.getCount()} />
				<ActionDispatcher label='chamberData.getStaticChamberCount()' onAction={() => client.chamberData.getStaticChamberCount()} />
				<ActionDispatcher label='chamberData.getDynamicChamberCount()' onAction={() => client.chamberData.getDynamicChamberCount()} />
				<ActionDispatcher label='chamberData.getDynamicChambersIds()' onAction={() => client.chamberData.getDynamicChambersIds()} />
				<ActionDispatcher label='chamberData.getDynamicChambersCoords()' onAction={() => client.chamberData.getDynamicChambersCoords()} />
				<ActionDispatcher label='tokenIdToCoord.get(1)' onAction={() => client.tokenIdToCoord.get(1)} />
				<ActionDispatcher label='tokenIdToCoord.getTokensCoords(edges)' onAction={() => client.tokenIdToCoord.getTokensCoords(edgesIds)} />
				<ActionDispatcher label={`chamberData.get(${tokenCoords?.coord})`} onAction={() => client.chamberData.get(tokenCoords?.coord ?? 0n)} />
				<ActionDispatcher label='chamberData.getMultiple(edges)' onAction={() => client.chamberData.getMultiple(edgesCoord)} />
			</div>

		</div>
	)
}

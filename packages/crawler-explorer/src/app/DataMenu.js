import React, { useMemo } from 'react'
import { Divider } from 'semantic-ui-react'
import {
	getAllViews,
	getViewNames,
	getView,
	getChamberCount,
	getStaticChamberCount,
	getEdgeChamberCount,
	getEdgeChambersId,
	getEdgeChambersCoord,
	getTokenCoords,
	getTokensCoords,
	getChamberData,
	getChambersData,
} from '@avante/crawler-data'
import { DataDispatcher, ActionDispatcher } from '@/components/Dispatchers'

export default function DataMenu() {

	const views = useMemo(() => {
		let result = []
		const vs = getAllViews()
		for (const viewName of getViewNames()) {
			const count = Object.keys(vs[viewName]).length
			result.push(
				<div key={viewName} >
					<DataDispatcher data={getView(viewName)} br={false}>
						{viewName}
					</DataDispatcher>
					{` `}[{count}]
				</div>
			)
		}
		return result
	}, [])

	// Chambers
	const edgesIds = useMemo(() => getEdgeChambersId(), [])
	const edgesCoord = useMemo(() => getEdgeChambersCoord(), [])
	const tokenCoords = useMemo(() => getTokenCoords(1), [])

	return (
		<div>

			Chambers
			<div>
				<ActionDispatcher onAction={() => getChamberCount()}>getChamberCount()</ActionDispatcher>
				<ActionDispatcher onAction={() => getStaticChamberCount()}>getStaticChamberCount()</ActionDispatcher>
				<ActionDispatcher onAction={() => getEdgeChamberCount()}>getEdgeChamberCount()</ActionDispatcher>
				<ActionDispatcher onAction={() => getEdgeChambersId()}>getEdgeChambersId()</ActionDispatcher>
				<ActionDispatcher onAction={() => getEdgeChambersCoord()}>getEdgeChambersCoord()</ActionDispatcher>
				<ActionDispatcher onAction={() => getTokenCoords(1)}>getTokenCoords(1)</ActionDispatcher>
				<ActionDispatcher onAction={() => getTokensCoords(edgesIds)}>getTokensCoords(edges)</ActionDispatcher>
				<ActionDispatcher onAction={() => getChamberData(tokenCoords.coord)}>getChamberData({tokenCoords.coord})</ActionDispatcher>
				<ActionDispatcher onAction={() => getChambersData(edgesCoord)}>getChambersData(edges)</ActionDispatcher>
			</div>

			<Divider hidden />

			Views
			<div>
				<ActionDispatcher onAction={() => getViewNames()}>getViewNames()</ActionDispatcher>
				{views}
			</div>

		</div>
	)
}

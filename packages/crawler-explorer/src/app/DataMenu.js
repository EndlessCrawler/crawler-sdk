import React, { useMemo } from 'react'
import { Divider } from 'semantic-ui-react'
import {
	Views,
	Chambers,
} from '@avante/crawler-data'
import { DataDispatcher, ActionDispatcher } from '@/components/Dispatchers'

export default function DataMenu() {

	const views = useMemo(() => {
		let result = []
		const vs = Views.getAllViews()
		for (const viewName of Views.getViewNames()) {
			const count = Object.keys(vs[viewName]).length
			result.push(
				<div key={viewName} >
					<DataDispatcher data={Views.getView(viewName)} br={false}>
						{viewName}
					</DataDispatcher>
					{` `}[{count}]
				</div>
			)
		}
		return result
	}, [])

	// Chambers
	const edgesIds = useMemo(() => Chambers.getEdgeChambersId(), [])
	const edgesCoord = useMemo(() => Chambers.getEdgeChambersCoord(), [])
	const tokenCoords = useMemo(() => Chambers.getTokenCoords(1), [])

	return (
		<div>

			Chambers
			<div>
				<ActionDispatcher onAction={() => Chambers.getChamberCount()}>getChamberCount()</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getStaticChamberCount()}>getStaticChamberCount()</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getEdgeChamberCount()}>getEdgeChamberCount()</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getEdgeChambersId()}>getEdgeChambersId()</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getEdgeChambersCoord()}>getEdgeChambersCoord()</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getTokenCoords(1)}>getTokenCoords(1)</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getTokensCoords(edgesIds)}>getTokensCoords(edges)</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getChamberData(tokenCoords.coord)}>getChamberData({tokenCoords.coord})</ActionDispatcher>
				<ActionDispatcher onAction={() => Chambers.getChambersData(edgesCoord)}>getChambersData(edges)</ActionDispatcher>
			</div>

			<Divider hidden />

			Views
			<div>
				<ActionDispatcher onAction={() => Views.getViewNames()}>getViewNames()</ActionDispatcher>
				{views}
			</div>

		</div>
	)
}

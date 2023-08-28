import React, { useMemo } from 'react'
import { Divider } from 'semantic-ui-react'
import {
	// do better here!
	mainnetData,
	importChainData,
	//
	getAllViews,
	getViewNames,
	getView,
	getViewDataCount,
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
import {
	readViewTotalCount,
} from '@avante/crawler-api'
import { ActionDispatcher, AsyncActionDispatcher } from '@/components/Dispatchers'

importChainData([mainnetData])

export default function DataMenu() {

	const views = useMemo(() => {
		let result = []
		const vs = getAllViews()
		for (const viewName of getViewNames()) {
			//@ts-ignore
			const view = getView(viewName)
			const count = Object.keys(view.data).length
			result.push(
				<div>
					{`>`} {viewName} [{count}]
					<div key={viewName} >
						<ActionDispatcher onAction={() => getView(viewName)}>getView()</ActionDispatcher>
						<ActionDispatcher onAction={() => getViewDataCount(viewName)}>getViewDataCount()</ActionDispatcher>
						{/* @ts-ignore */}
						<AsyncActionDispatcher onAction={() => readViewTotalCount(viewName)}>readViewTotalCount()</AsyncActionDispatcher>
					</div>
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
				<ActionDispatcher onAction={() => getAllViews()}>getAllViews(current)</ActionDispatcher>
				{views}
			</div>

		</div>
	)
}

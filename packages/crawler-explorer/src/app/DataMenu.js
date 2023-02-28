import React, { useMemo } from 'react'
import {
	Views,
	Chambers,
} from '@avante/crawler-data'
import { ResultsDispatcher } from '@/components/Dispatchers'

export default function DataMenu() {

	const views = useMemo(() => {
		let result = []
		const vs = Views.getAllViews()
		for (const viewName of Views.getViewNames()) {
			const count = Object.keys(vs[viewName]).length
			result.push(
				<div key={viewName} >
					<ResultsDispatcher data={Views.getView(viewName)} br={false}>
						{viewName}
					</ResultsDispatcher>
					({count})
				</div>
			)
		}
		return result;
	})

	// Chambers
	const chamberCount = useMemo(() => Chambers.getChamberCount(), [])
	const staticCount = useMemo(() => Chambers.getStaticChamberCount(), [])
	const edgeCount = useMemo(() => Chambers.getEdgeChamberCount(), [])
	const edgesId = useMemo(() => Chambers.getEdgeChambersId(), [])
	const edgesCoord = useMemo(() => Chambers.getEdgeChambersCoord(), [])
	const tokenCoords = useMemo(() => Chambers.getTokenCoords(1), [])
	const tokensCoords = useMemo(() => Chambers.getTokensCoords(edgesId), [])
	const chamberData = useMemo(() => Chambers.getChamberData(tokenCoords.coord), [])
	const chambersData = useMemo(() => Chambers.getChambersData(edgesCoord), [])

	return (
		<div>

			Chambers
			<p>
				<ResultsDispatcher data={chamberCount}>getChamberCount()</ResultsDispatcher>
				<ResultsDispatcher data={staticCount}>getStaticChamberCount()</ResultsDispatcher>
				<ResultsDispatcher data={edgeCount}>getEdgeChamberCount()</ResultsDispatcher>
				<ResultsDispatcher data={edgesId}>getEdgeChambersId()</ResultsDispatcher>
				<ResultsDispatcher data={edgesCoord}>getEdgeChambersCoord()</ResultsDispatcher>
				<ResultsDispatcher data={tokenCoords}>getTokenCoords(1)</ResultsDispatcher>
				<ResultsDispatcher data={tokensCoords}>getTokensCoords(edges)</ResultsDispatcher>
				<ResultsDispatcher data={chamberData}>getChamberData(1)</ResultsDispatcher>
				<ResultsDispatcher data={chambersData}>getChambersData(edges)</ResultsDispatcher>
			</p>

			Views
			<p>
				{views}
			</p>
		</div>
	);
}

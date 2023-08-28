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
import { ActionDispatcher } from '@/components/Dispatchers'

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
				<div key={viewName} >
					<Divider hidden />
					{`>`} {viewName} [{count}]
					<div>
						<ActionDispatcher label='getView()' onAction={() => getView(viewName)} />
						<ActionDispatcher label='getViewDataCount()' onAction={() => getViewDataCount(viewName)} />
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
				<ActionDispatcher label='getChamberCount()' onAction={() => getChamberCount()} />
				<ActionDispatcher label='getStaticChamberCount()' onAction={() => getStaticChamberCount()} />
				<ActionDispatcher label='getEdgeChamberCount()' onAction={() => getEdgeChamberCount()} />
				<ActionDispatcher label='getEdgeChambersId()' onAction={() => getEdgeChambersId()} />
				<ActionDispatcher label='getEdgeChambersCoord()' onAction={() => getEdgeChambersCoord()} />
				<ActionDispatcher label='getTokenCoords(1)' onAction={() => getTokenCoords(1)} />
				<ActionDispatcher label='getTokensCoords(edges)' onAction={() => getTokensCoords(edgesIds)} />
				<ActionDispatcher label={`getChamberData(${tokenCoords.coord})`} onAction={() => getChamberData(tokenCoords.coord)} />
				<ActionDispatcher label='getChambersData(edges)' onAction={() => getChambersData(edgesCoord)} />
			</div>

			<Divider hidden />

			Views
			<div>
				<ActionDispatcher label='getViewNames()' onAction={() => getViewNames()} />
				<ActionDispatcher label='getAllViews(current)' onAction={() => getAllViews()} />
				{views}
			</div>

		</div>
	)
}

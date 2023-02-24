import React, { useMemo, useContext } from 'react'
import { Grid } from 'semantic-ui-react'
import { FetchContext, useFetchState } from '@/hooks/FetchContext'
import {
	Views,
	Chambers,
} from '@avante/crawler-data'

const Row = Grid.Row;
const Col = Grid.Column;

export default function DrawerCached() {
	const { dispatchResults } = useContext(FetchContext)

	const views = useMemo(() => {
		let result = []
		const vs = Views.getAllViews()
		for (const viewName of Views.getViewNames()) {
			const count = Object.keys(vs[viewName]).length
			result.push(
				<div key={viewName} >
					<span className='Anchor' onClick={() => dispatchResults(Views.getView(viewName))}>
						{viewName}
					</span> ({count})
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

	const _method = (label, data) => {
		return <span className='Anchor' onClick={() => dispatchResults(data)}>{label}<br /></span>
	}

	return (
		<div>

			Chambers
			<p>
				{_method('getChamberCount()', chamberCount)}
				{_method('getStaticChamberCount()', staticCount)}
				{_method('getEdgeChamberCount()', edgeCount)}
				{_method('getEdgeChambersId()', edgesId)}
				{_method('getEdgeChambersCoord()', edgesCoord)}
				{_method('getTokenCoords(1)', tokenCoords)}
				{_method('getTokensCoords(edges)', tokensCoords)}
				{_method('getChamberData(1)', chamberData)}
				{_method('getChambersData(edges)', chambersData)}
			</p>

			Views
			<p>
				{views}
			</p>
		</div>
	);
}

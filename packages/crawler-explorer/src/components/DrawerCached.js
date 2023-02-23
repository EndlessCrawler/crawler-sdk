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
				<span className='Anchor' onClick={() => _click(viewName)}>
					{viewName}
					</span> ({ count })
				</div>
			)
		}
		return result;
	})

	const _click = (viewName) => {
		const view = Views.getView(viewName)
		dispatchResults(view)
	}

	const chamberCount = Chambers.getChamberCount()

	return (
		<div>
			count: {chamberCount}
			{views}
		</div>
	);
}

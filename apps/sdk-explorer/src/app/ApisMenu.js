import React, { useMemo } from 'react'
import { Divider } from 'semantic-ui-react'
import {
	getAllViews,
	getViewNames,
	getView,
	ViewName,
	getTokenCoords,
} from '@avante/crawler-core'
import {
	readViewRecordOrThrow,
	readViewTotalCount,
} from '@avante/crawler-api'
import { UrlDispatcher, AsyncActionDispatcher } from '@/components/Dispatchers'

export default function ApisMenu() {

	const tokenCoords = useMemo(() => getTokenCoords(1), [])

	const views = useMemo(() => {
		let result = []
		const vs = getAllViews()
		for (const viewName of getViewNames()) {
			//@ts-ignore
			const view = getView(viewName)
			const count = Object.keys(view.data).length
			const readViewOptions =
				viewName == ViewName.tokenIdToCoord ? {
					viewName,
					key: '1',
				} : viewName == ViewName.chamberData ? {
					viewName,
					key: tokenCoords.coord.toString(),
				} : {
					viewName,
				}
			result.push(
				<div key={viewName} >
					<Divider hidden />
					{`_`}{viewName} [{count}]
					<div>
						{/* @ts-ignore */}
						<AsyncActionDispatcher label='readViewTotalCount()' onAction={() => readViewTotalCount(viewName)} />
						{/* @ts-ignore */}
						<AsyncActionDispatcher label={`readViewRecordOrThrow(${readViewOptions.key})`} onAction={() => readViewRecordOrThrow(readViewOptions)} />
					</div>
				</div>
			)
		}
		return result
	}, [])

	return (
		<div>
			/api/read
			<div>
				<UrlDispatcher label='totalSupply' url='/api/read/1/CrawlerToken/totalSupply' />
				<UrlDispatcher label='ownerOf/1' url='/api/read/1/CrawlerToken/ownerOf/1' />
				<UrlDispatcher label='tokenURI/1' url='/api/read/1/CrawlerToken/tokenURI/1' />
			</div>

			<Divider hidden />

			/api/view
			<div>
				<UrlDispatcher label='tokenIdToCoord/1' url='/api/view/1/tokenIdToCoord/1/1' />
				<UrlDispatcher label='chamberData/1' url='/api/view/1/chamberData/18446744073709551617/1/18446744073709551617/false' />
				<UrlDispatcher label='chamberData/1+maps' url='/api/view/1/chamberData/18446744073709551617/1/18446744073709551617/true' />
			</div>

			{views}

		</div>
	)
}

import React from 'react'
import { Divider } from 'semantic-ui-react'
import { UrlDispatcher } from '@/components/Dispatchers'

export default function ApisMenu() {
	return (
		<div>
			/readContract
			<div>
				<UrlDispatcher url='/api/read/1/CrawlerToken/totalSupply'>totalSupply()</UrlDispatcher>
				<UrlDispatcher url='/api/read/1/CrawlerToken/ownerOf/1'>ownerOf(1)</UrlDispatcher>
				<UrlDispatcher url='/api/read/1/CrawlerToken/tokenURI/1'>tokenURI(1)</UrlDispatcher>
			</div>

			<Divider hidden />

			/view
			<div>
				<UrlDispatcher url='/api/view/1/tokenIdToCoord/1/1'>tokenIdToCoord(1)</UrlDispatcher>
				<UrlDispatcher url='/api/view/1/chamberData/18446744073709551617/1/18446744073709551617/false'>chamberData(1)</UrlDispatcher>
				<UrlDispatcher url='/api/view/1/chamberData/18446744073709551617/1/18446744073709551617/true'>chamberData(1) + maps</UrlDispatcher>
			</div>

		</div>
	)
}

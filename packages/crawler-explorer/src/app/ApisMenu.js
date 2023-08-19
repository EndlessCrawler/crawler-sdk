import React from 'react'
import { Divider } from 'semantic-ui-react'
import { UrlDispatcher } from '@/components/Dispatchers'

export default function ApisMenu() {
	return (
		<div>
			/readContract
			<div>
				<UrlDispatcher url='/api/read/totalSupply?contractName=CrawlerToken&chainId=1'>totalSupply()</UrlDispatcher>
				<UrlDispatcher url='/api/read/ownerOf/1?contractName=CrawlerToken&chainId=1'>ownerOf(1)</UrlDispatcher>
			</div>

			<Divider hidden />

			/view
			<div>
				<UrlDispatcher url='/api/view/tokenIdToCoord/1/1?chainId=1'>tokenIdToCoord(1)</UrlDispatcher>
				<UrlDispatcher url='/api/view/chamberData/18446744073709551617/1/18446744073709551617/false?chainId=1'>chamberData(1)</UrlDispatcher>
				<UrlDispatcher url='/api/view/chamberData/18446744073709551617/1/18446744073709551617/true?chainId=1'>chamberData(1) + maps</UrlDispatcher>
			</div>

		</div>
	)
}

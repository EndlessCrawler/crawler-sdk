import React from 'react'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import { UrlDispatcher } from '@/components/Dispatchers'

export default function Home() {
	return (
		<Page>
			<Layout>

				/read
				<p>
					<UrlDispatcher url='/api/read/totalSupply?contractName=CrawlerToken&chainId=1'>totalSupply</UrlDispatcher>
					<UrlDispatcher url='/api/read/ownerOf/5?contractName=CrawlerToken&chainId=1'>ownerOf</UrlDispatcher>
				</p>

				/view
				<p>
					<UrlDispatcher url='/api/view/tokenIdToCoord/1/1?chainId=1'>tokenIdToCoord</UrlDispatcher>
					<UrlDispatcher url='/api/view/chamberData/18446744073709551617/1/18446744073709551617/false?chainId=1'>chamberData</UrlDispatcher>
					<UrlDispatcher url='/api/view/chamberData/18446744073709551617/1/18446744073709551617/true?chainId=1'>chamberData + maps</UrlDispatcher>
				</p>

			</Layout>
		</Page>
	);
}

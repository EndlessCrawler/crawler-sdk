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
					<UrlDispatcher url='/api/view/tokenIdToCoord?chainId=1&tokenId=1'>tokenIdToCoord</UrlDispatcher>
				</p>

			</Layout>
		</Page>
	);
}

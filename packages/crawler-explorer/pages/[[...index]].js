import React, { useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Grid, List, Divider } from 'semantic-ui-react'
import { FetchContext } from '@/hooks/FetchContext'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import DrawerViews from '@/components/DrawerViews'
import DrawerCached from '@/components/DrawerCached'
import Item from '@/components/Item'

const Row = Grid.Row;
const Col = Grid.Column;

export default function Home() {
	const router = useRouter()
	const { index } = router.query
	const { dispatchUrl } = useContext(FetchContext)

	return (
		<Page className='Relative'>
			<Layout>
				{index == 'views' && <DrawerViews />}
				{index == 'data' && <DrawerCached />}
				{!index &&
					<List bulleted>
						<Item url='/api/read/totalSupply?contractName=CrawlerToken&chainId=1' onClick={(url) => dispatchUrl(url)}>totalSupply</Item>
						<Item url='/api/read/ownerOf/5?contractName=CrawlerToken&chainId=1' onClick={(url) => dispatchUrl(url)}>ownerOf</Item>
						<Item url='/api/view/tokenIdToCoord?chainId=1&tokenId=1' onClick={(url) => dispatchUrl(url)}>tokenIdToCoord</Item>
					</List>
				}
			</Layout>
		</Page>
	);
}

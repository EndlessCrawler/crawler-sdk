import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Grid, List, Divider } from 'semantic-ui-react'
import JsonResults from '@/components/JsonResults'
import Page from '@/components/Page'

const Row = Grid.Row;
const Col = Grid.Column;

function Item({ url, onClick, children }) {
	return (
		<List.Item className='Anchor' onClick={() => onClick(url)}>
			{/* <a href={url}> */}
				{children}
			{/* </a> */}
		</List.Item>
	);
}

export default function Home() {
	const [url, setUrl] = useState(null);
	const [results, setResults] = useState({});

	// console.log(url, results)

	return (
		<Page>
			<div className='Drawer'>
				<Grid>
					<Col width={4}><img src='/door.png' className='Logo PixelArt' alt='' /></Col>
					<Col><h2>ENDLESS<br />CRAWLER</h2></Col>
				</Grid>
				<Divider />
				<List bulleted>
					<Item url='/api/read/totalSupply?contractName=CrawlerToken&chainId=1' onClick={(v) => setUrl(v)}>totalSupply</Item>
					<Item url='/api/read/ownerOf/5?contractName=CrawlerToken&chainId=1' onClick={(v) => setUrl(v)}>ownerOf</Item>
					<Item url='/api/view/tokenIdToCoord?chainId=1&tokenId=1' onClick={(v) => setUrl(v)}>tokenIdToCoord</Item>
				</List>

			</div>
			<div className='ResultsContainer'>
				<JsonResults url={url} onResults={(v) => setResults(v)} />
			</div>
		</Page>
	);
}

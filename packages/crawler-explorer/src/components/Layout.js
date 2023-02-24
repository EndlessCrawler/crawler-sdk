import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Grid, Divider } from 'semantic-ui-react'
import Results from '@/components/Results'

const Row = Grid.Row;
const Col = Grid.Column;

function DrawerItem({
	slug,
}) {
	const router = useRouter()
	const { index } = router.query

	return (
		<Link className='Anchor' href={`/${slug}`}>
			{index == slug ? <b>{slug}</b> : slug}
		</Link>
	);
}

export default function Home({
	children,
}) {
	const [url, setUrl] = useState(null);
	const [results, setResults] = useState({});

	// console.log(url, results)

	return (
		<div>
			<div className='Drawer'>
				<div className='Padded'>
					<Grid>
						<Col width={4}><Link href='/'><img src='/door.png' className='Logo PixelArt' alt='' /></Link></Col>
						<Col><h2>ENDLESS<br />CRAWLER</h2></Col>
					</Grid>
					<div>
						{` · `}
						<DrawerItem slug='data' />
						{` · `}
						<DrawerItem slug='views' />
						{` · `}
					</div>
				</div>
				<Divider />
				<div className='Padded'>
					{children}
				</div>
			</div>
			<div className='ResultsContainer'>
				<Results url={url} onResults={(v) => setResults(v)} />
			</div>
		</div>
	);
}

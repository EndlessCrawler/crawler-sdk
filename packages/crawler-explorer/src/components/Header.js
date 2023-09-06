import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Grid, Divider } from 'semantic-ui-react'
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit'

const Row = Grid.Row
const Col = Grid.Column

const pages = {
	data: {
		onChain: false,
	},
	apis: {
		onChain: true,
	}
}

export default function Header() {
	const router = useRouter()

	const currentSlug = useMemo(() => {
		return router.pathname?.slice(1) ?? null
	}, [router.pathname])

	const menu = useMemo(() => {
		let result = []
		for (const slug of Object.keys(pages)) {
			// const page = pages[slug]
			result.push(
				<span key={slug}>
					<Link className='Anchor' href={`/${slug}`}>
						{currentSlug == slug ? <b>{slug}</b> : slug}
					</Link>
					{` · `}
				</span>
			)
		}
		return result
	}, [currentSlug])

	return (
		<div>
			<div className='Header Padded'>
				<div className='HeaderMenu'>

					<Grid>
						<Col width={2}><Link href='/'><img src='/door.png' className='Logo PixelArt' alt='' /></Link></Col>
						<Col width={14}><h2>CRAWLER SDK EXPLORER</h2></Col>
					</Grid>

					<div>
						{`· `}
						{menu}
					</div>
				</div>

				<div className='ConnectCorner'>
					<ConnectKitButton />
				</div>

			</div>
		</div>
	)
}

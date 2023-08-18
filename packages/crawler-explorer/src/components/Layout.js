import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Grid, Divider } from 'semantic-ui-react'
import Results from '@/components/Results'

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

export default function Layout({
	children,
}) {
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

	const onChain = useMemo(() => {
		return currentSlug ? (pages[currentSlug]?.onChain) : undefined
	}, [currentSlug])
	// console.log(currentSlug)

	return (
		<div>
			<div className='Drawer'>
				<div className='Padded'>
					<Grid>
						<Col width={4}><Link href='/'><img src='/door.png' className='Logo PixelArt' alt='' /></Link></Col>
						<Col width={12}><h2>CRAWLER SDK<br />EXPLORER</h2></Col>
					</Grid>

					<div>
						{`· `}
						{menu}
					</div>
				</div>

				<Divider />

				<div className='Padded'>
					{onChain === true && <p>(on-chain)</p>}
					{onChain === false && <p>(off-chain)</p>}
					<Divider hidden />
					{children}
				</div>
			</div>

			<div className='ResultsContainer'>
				<Results />
			</div>
		</div>
	)
}

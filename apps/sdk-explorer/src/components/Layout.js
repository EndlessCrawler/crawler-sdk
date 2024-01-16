import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Grid, Divider } from 'semantic-ui-react'
import Header from '@/components/Header'
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
			<Header />
			
			<div className='Drawer'>

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

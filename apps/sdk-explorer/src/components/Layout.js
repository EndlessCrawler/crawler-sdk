import React from 'react'
import { Divider } from 'semantic-ui-react'
import Header from '@/components/Header'
import Results from '@/components/Results'

export default function Layout({
	title = null,
	children,
}) {
	return (
		<div>
			<Header />
			
			<div className='Drawer'>

				<div className='Padded'>
					{title && <h3>{title}</h3>}
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

import React from 'react'
import { Divider } from 'semantic-ui-react'
import Header from '@/components/Header'
import Results from '@/components/Results'
import DataSetSelector from '@/app/DataSetSelector'

interface LayoutProps {
	title: string | null
}

export default function Layout({
	title = null,
	children,
}: React.PropsWithChildren<LayoutProps>) {
	return (
		<div>
			<Header />
			
			<div className='Drawer'>

				<div className='Padded'>
					<DataSetSelector />
					<Divider hidden />
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

import React from 'react'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import DataMenu from '@/app/DataMenu'

export default function DataPage() {
	return (
		<Page>
			<Layout title='off-chain calls'>
				<DataMenu />
			</Layout>
		</Page>
	);
}

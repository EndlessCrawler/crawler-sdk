import React from 'react'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import DataMenu from '@/app/DataMenu'

export default function DataPage() {
	return (
		<Page>
			<Layout>
				<DataMenu />
			</Layout>
		</Page>
	);
}

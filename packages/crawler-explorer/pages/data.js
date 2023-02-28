import React from 'react'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import DataMenu from '@/app/DataMenu'

export default function Home() {
	return (
		<Page>
			<Layout>
				<DataMenu />
			</Layout>
		</Page>
	);
}

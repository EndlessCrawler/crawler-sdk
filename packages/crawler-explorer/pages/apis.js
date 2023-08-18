import React from 'react'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import ViewsMenu from '@/app/ApisMenu'

export default function Home() {
	return (
		<Page>
			<Layout>
				<ViewsMenu />
			</Layout>
		</Page>
	);
}

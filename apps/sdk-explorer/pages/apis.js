import React from 'react'
import Page from '@/components/Page'
import Layout from '@/components/Layout'
import ApisMenu from '@/app/ApisMenu'

export default function ApisPage() {
	return (
		<Page>
			<Layout title='on-chain calls'>
				<ApisMenu />
			</Layout>
		</Page>
	);
}

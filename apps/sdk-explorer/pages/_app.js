import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import React, { useState } from 'react'
import Wagmi from '@/components/Wagmi'
import Head from '@/components/Head'
import { FetchProvider } from '@/hooks/FetchContext'
import { useEffectOnce } from '@/hooks/useEffectOnce'

import { createClient } from '@avante/crawler-core'
import { EndlessCrawler } from '@avante/crawler-core'
import { mainnetDataSet, goerliDataSet } from '@avante/crawler-data'
import { CrawlerProvider } from '@avante/crawler-react'

function _app({ Component, pageProps }) {
	const [client, setClient] = useState<EndlessCrawler.Module>(null)
	
	useEffectOnce(() => {
		setClient(createClient([mainnetDataSet, goerliDataSet]))
	}, [])

	return (
		<CrawlerProvider client={client}>
			<Wagmi>
				<FetchProvider>
					<Head />
					<Component {...pageProps} />
				</FetchProvider>
			</Wagmi>
		</CrawlerProvider>
	)
}

export default _app

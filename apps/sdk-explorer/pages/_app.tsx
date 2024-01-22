import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import Wagmi from '@/components/Wagmi'
import Head from '@/components/Head'
import { FetchProvider } from '@/hooks/FetchContext'
import { useEffectOnce } from '@/hooks/useEffectOnce'

import { createClient } from '@avante/crawler-core'
import { EndlessCrawler } from '@avante/crawler-core'
import { mainnetDataSet, goerliDataSet } from '@avante/crawler-data'
import { CrawlerProvider } from '@avante/crawler-react'

const client = createClient([mainnetDataSet, goerliDataSet]) as EndlessCrawler.Module

export default function _app({ Component, pageProps }: AppProps) {
	// const [client, setClient] = useState<EndlessCrawler.Module>()	
	// useEffectOnce(() => {
	// 	setClient(createClient([mainnetDataSet, goerliDataSet]) as EndlessCrawler.Module)
	// }, [])

	return (
		<CrawlerProvider client={client as EndlessCrawler.Module}>
			<Wagmi>
				<FetchProvider>
					<Head />
					<Component {...pageProps} />
				</FetchProvider>
			</Wagmi>
		</CrawlerProvider>
	)
}

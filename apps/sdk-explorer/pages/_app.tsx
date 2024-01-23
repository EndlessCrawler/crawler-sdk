import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import React from 'react'
import type { AppProps } from 'next/app'
import Wagmi from '@/components/Wagmi'
import Head from '@/components/Head'
import { FetchProvider } from '@/hooks/FetchContext'

import { createClient, EndlessCrawler } from '@avante/crawler-core'
import { mainnetDataSet, goerliDataSet } from '@avante/crawler-data'
import { CrawlerProvider } from '@avante/crawler-react'

const client = createClient([mainnetDataSet, goerliDataSet])
// const client = createClient(EndlessCrawler.Id, true) // creates a new blank Module

export default function _app({ Component, pageProps }: AppProps) {
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

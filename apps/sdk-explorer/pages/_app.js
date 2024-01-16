import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import React from 'react'
import Wagmi from '@/components/Wagmi'
import Head from '@/components/Head'
import { FetchProvider } from '@/hooks/FetchContext'

import {
	mainnetData,
	goerliData,
	importChainData,
} from '@avante/crawler-data'

importChainData([mainnetData, goerliData])

function _app({ Component, pageProps }) {
	return (
		<Wagmi>
			<FetchProvider>
				<Head />
				<Component {...pageProps} />
			</FetchProvider>
		</Wagmi>
	)
}

export default _app

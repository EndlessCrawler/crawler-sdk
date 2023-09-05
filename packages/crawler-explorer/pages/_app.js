import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import { FetchProvider } from '@/hooks/FetchContext'
import Head from '@/components/Head'

import {
	mainnetData,
	goerliData,
	importChainData,
} from '@avante/crawler-data'

importChainData([mainnetData, goerliData])

function _app({ Component, pageProps }) {
	return (
		<FetchProvider>
			<Head />
			<Component {...pageProps} />
		</FetchProvider>
	)
}

export default _app

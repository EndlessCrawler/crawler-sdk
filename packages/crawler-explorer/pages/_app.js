import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import { FetchProvider } from '@/hooks/FetchContext'
import Head from '@/components/Head'

function _app({ Component, pageProps }) {
	return (
		<FetchProvider>
			<Head />
			<Component {...pageProps} />
		</FetchProvider>
	)
}

export default _app

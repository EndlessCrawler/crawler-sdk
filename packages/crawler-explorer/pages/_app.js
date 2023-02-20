import 'semantic-ui-css/semantic.min.css'
import '/styles/styles.scss'
import { FetchProvider } from '@/hooks/FetchContext'

function _app({ Component, pageProps }) {
	return (
		<FetchProvider>
			<Component {...pageProps} />
		</FetchProvider>
	);
}

export default _app;

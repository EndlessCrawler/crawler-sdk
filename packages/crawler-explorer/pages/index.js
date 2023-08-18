import React from 'react'
import { Divider } from 'semantic-ui-react'
import { UrlDispatcher, ResultsDispatcher } from '@/components/Dispatchers'
import Page from '@/components/Page'
import Layout from '@/components/Layout'

export default function Home() {
	const _object = { name: 'John D. Doe', names: ['John', 'D', 'Doe'] }
	return (
		<Page>
			<Layout>

				api route
				<div>
					<UrlDispatcher url='/api/hello'>/api/hello</UrlDispatcher>
				</div>

				<Divider hidden />
				
				url
				<div>
					<UrlDispatcher url='https://brasilapi.com.br/api/feriados/v1/2023'>/feriados</UrlDispatcher>
				</div>

				<Divider hidden />

				data
				<div>
					<ResultsDispatcher data={123456}>int</ResultsDispatcher>
					<ResultsDispatcher data={123.456}>float</ResultsDispatcher>
					<ResultsDispatcher data={12345678901234567890n}>BigInt</ResultsDispatcher>
					<ResultsDispatcher data={'Hello World!'}>string</ResultsDispatcher>
					<ResultsDispatcher data={_object}>object</ResultsDispatcher>
					<ResultsDispatcher data={_object.names}>array</ResultsDispatcher>
				</div>

				<Divider hidden />

			</Layout>
		</Page>
	)
}

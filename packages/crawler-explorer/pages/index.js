import React from 'react'
import { Divider } from 'semantic-ui-react'
import { UrlDispatcher, DataDispatcher, ActionDispatcher } from '@/components/Dispatchers'
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

				action
				<div>
					<ActionDispatcher onAction={() => Date.now()}>Date.now()</ActionDispatcher>
				</div>

				<Divider hidden />

				data
				<div>
					<DataDispatcher data={123456}>int</DataDispatcher>
					<DataDispatcher data={123.456}>float</DataDispatcher>
					<DataDispatcher data={12345678901234567890n}>BigInt</DataDispatcher>
					<DataDispatcher data={'Hello World!'}>string</DataDispatcher>
					<DataDispatcher data={_object}>object</DataDispatcher>
					<DataDispatcher data={_object.names}>array</DataDispatcher>
				</div>

				<Divider hidden />

			</Layout>
		</Page>
	)
}

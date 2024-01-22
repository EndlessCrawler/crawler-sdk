import React from 'react'
import { Divider } from 'semantic-ui-react'
import { UrlDispatcher, DataDispatcher, ActionDispatcher } from '@/components/Dispatchers'
import Page from '@/components/Page'
import Layout from '@/components/Layout'

export default function Home() {
	const _object = { name: 'John D. Doe', names: ['John', 'D', 'Doe'] }
	return (
		<Page>
			<Layout title='sample results'>

				api route
				<div>
					<UrlDispatcher label='/api/hello' url='/api/hello' />
				</div>

				<Divider hidden />
				
				url
				<div>
					<UrlDispatcher label='/feriados' url='https://brasilapi.com.br/api/feriados/v1/2023' />
				</div>

				<Divider hidden />

				action
				<div>
					<ActionDispatcher label='Date.now()' onAction={() => Date.now()} />
				</div>

				<Divider hidden />

				data
				<div>
					<DataDispatcher label='int' data={123456} />
					<DataDispatcher label='float' data={123.456} />
					<DataDispatcher label='BigInt' data={12345678901234567890n} />
					<DataDispatcher label='string' data={'Hello World!'} />
					<DataDispatcher label='object' data={_object} />
					<DataDispatcher label='array' data={_object.names} />
				</div>

				<Divider hidden />

			</Layout>
		</Page>
	)
}

import React, { useEffect } from 'react'
import { LinkIcon, LoadingIcon, CopyIcon } from '@/components/Icons'
import { useFetchContext, useFetchState } from '@/hooks/FetchContext'
import { useFetch } from '@/hooks/useFetch'
import MonacoEditor from '@/components/MonacoEditor'

export default function Results() {
	const { name, url, args, params, results } = useFetchState()
	const { data, error, isFetching } = useFetch(url, args, params)
	const { dispatchResults } = useFetchContext()

	useEffect(() => {
	}, [url, args, params])

	useEffect(() => {
		if (isFetching) {
			dispatchResults('...')
		} else if (data) {
			dispatchResults(data)
		} else if (error) {
			dispatchResults(error)
		}
	}, [data, error, isFetching])

	useEffect(() => {
		dispatchResults(results)
	}, [results])

	const _jsonResults = typeof results == 'object' ? results : [results]
	// const _jsonResults = results

	return (
		<div>
			<div className='Url'>
				<LinkIcon url={url} />
				{' '}
				{url ?? name}
			</div>

			<div className='Url'>
				{isFetching ? <LoadingIcon />
					: <CopyIcon content={JSON.stringify(results)} />
				}
				{' '}
				{isFetching ? 'Fetching...'
					: Array.isArray(results) ? `Array size: ${results.length}`
						: typeof results == 'object' ? `Dict size: ${Object.keys(results).length}`
							: typeof results
				}
			</div>

			<MonacoEditor content={_jsonResults} />
		</div>
	)
}

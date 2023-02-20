import React, { useState, useEffect, useContext } from 'react'
import { LinkIcon, LoadingIcon, CopyIcon } from '@/components/Icons'
import { FetchContext, useFetchState } from '@/hooks/FetchContext'
import { useApi } from '@/hooks/useFetch'
import JSONPretty from 'react-json-prettify';

export default function Results() {
	const { url, args, params, results } = useFetchState()
	const { dispatchResults } = useContext(FetchContext)
	const { data, error, isFetching } = useApi(url, args, params);
	// console.log(url, args, params)

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
	}, [data, error, isFetching]);

	useEffect(() => {
		dispatchResults(results)
	}, [results])

	return (
		<div>
			<div className='Url'>
				<LinkIcon url={url} />
				{url}
			</div>

			<div className='Url'>
				{isFetching ?
					<LoadingIcon />
					: <CopyIcon content={JSON.stringify(results)} />
				}
				{' '}
				{isFetching ? 'Fetching...'
					: typeof (results) == 'string' ? `data`
						: Array.isArray(results) ? `Array size: ${results.length}`
							: `Dict size: ${Object.keys(results).length}`
				}
			</div>

			<JSONPretty json={results} />
		</div>
	);
}

import React, { useState, useEffect } from 'react'
import { CopyIcon, LoadingIcon } from '@/components/Icons'
import { useApi } from '@/hooks/useFetch'
import JSONPretty from 'react-json-prettify';

export default function JsonResults({
	url,
	params,
	onResults = (data) => { },
}) {
	const [results, setResults] = useState({});
	const { data, error, isFetching } = useApi(url, params);

	useEffect(() => {
	}, [url, params])

	useEffect(() => {
		if (isFetching) {
			setResults('...')
		} else if (data) {
			setResults(data)
		} else if (error) {
			setResults(error)
		}
	}, [data, error, isFetching]);

	useEffect(() => {
		onResults(results)
	}, [results])

	return (
		<div>
			<div className='Url'>
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

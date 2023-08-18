import React from 'react'
import { useFetchContext } from '@/hooks/FetchContext'

function UrlDispatcher({
	url,
	children,
	br = true,
}) {
	const { dispatchUrl } = useFetchContext()
	return (
		<span className='Anchor' onClick={() => dispatchUrl(url)}>
			{children}
			{br && <br />}
		</span>
	)
}

function ResultsDispatcher({
	data = {},
	children,
	br = true,
}) {
	const { dispatchData } = useFetchContext()

	return (
		<span className='Anchor' onClick={() => dispatchData(data)}>
			{children}
			{br && <br />}
		</span>
	)
}


export {
	UrlDispatcher,
	ResultsDispatcher,
}
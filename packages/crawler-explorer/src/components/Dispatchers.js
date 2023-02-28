import React, { useContext } from 'react'
import { FetchContext } from '@/hooks/FetchContext'

function UrlDispatcher({
	url,
	children,
	br = true,
}) {
	const { dispatchUrl } = useContext(FetchContext)
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
	const { dispatchResults } = useContext(FetchContext)
	return (
		<span className='Anchor' onClick={() => dispatchResults(data)}>
			{children}
			{br && <br />}
		</span>
	)
}


export {
	UrlDispatcher,
	ResultsDispatcher,
}
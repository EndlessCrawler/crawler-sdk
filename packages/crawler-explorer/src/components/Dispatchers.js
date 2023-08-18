import React from 'react'
import { useFetchContext } from '@/hooks/FetchContext'

//---------------------------------------------------------
// Dispatch a URL to the FetchContext
//
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


//---------------------------------------------------------
// Dispatch any arbitrary DATA to the FetchContext
//
function DataDispatcher({
	data = {},
	children,
	br = true,
}) {
	const { dispatchData } = useFetchContext()
	return (
		<span className='Anchor' onClick={() => dispatchData(data, children)}>
			{children}
			{br && <br />}
		</span>
	)
}


//---------------------------------------------------------
// Dispatch any arbitrary DATA to the FetchContext
//
function ActionDispatcher({
	onAction = () => {},
	children,
	br = true,
}) {
	const { dispatchData } = useFetchContext()
	return (
		<span className='Anchor' onClick={() => dispatchData(onAction(), children)}>
			{children}
			{br && <br />}
		</span>
	)
}


export {
	UrlDispatcher,
	DataDispatcher,
	ActionDispatcher,
}
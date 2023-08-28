import React, { useEffect, useState } from 'react'
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

function AsyncActionDispatcher({
	onAction = async () => { },
	children,
	br = true,
}) {
	const { dispatchData } = useFetchContext()
	const [fetching, setFetching] = useState(false)

	useEffect(() => {
		let _mounted = true
		const _fetch = async () => {
			const _data = await onAction()
			if(_mounted) {
				dispatchData(_data, children)
				setFetching(false)
			}
		}

		if (fetching) {
			dispatchData('...', children)
			_fetch()
		}
		return () => { _mounted = false }
	}, [fetching])

	return (
		<span className='Anchor' onClick={() => setFetching(true)}>
			{children}
			{br && <br />}
		</span>
	)
}


export {
	UrlDispatcher,
	DataDispatcher,
	ActionDispatcher,
	AsyncActionDispatcher,
}
import React, { useEffect, useState } from 'react'
import { useFetchContext } from '@/hooks/FetchContext'

//---------------------------------------------------------
// Dispatch a URL to the FetchContext
//
function UrlDispatcher({
	label,
	url,
	br = true,
}: {
	label: string,
	url: string,
	br?: boolean,
}) {
	const { dispatchUrl } = useFetchContext()
	return (
		<span className='Anchor' onClick={() => dispatchUrl(url)}>
			{label}
			{br && <br />}
		</span>
	)
}


//---------------------------------------------------------
// Dispatch any arbitrary DATA to the FetchContext
//
function DataDispatcher({
	label,
	data = {},
	br = true,
}: {
	label: string,
	data: any,
	br?: boolean,
}) {
	const { dispatchData } = useFetchContext()
	return (
		<span className='Anchor' onClick={() => dispatchData(data, label)}>
			{label}
			{br && <br />}
		</span>
	)
}


//---------------------------------------------------------
// Dispatch any arbitrary DATA to the FetchContext
//
function ActionDispatcher({
	label,
	onAction = () => {},
	br = true,
}: {
	label: string,
	onAction(): void,
	br?: boolean,
}) {
	const { dispatchData } = useFetchContext()
	return (
		<span className='Anchor' onClick={() => dispatchData(onAction(), label)}>
			{label}
			{br && <br />}
		</span>
	)
}

function AsyncActionDispatcher({
	label,
	onAction = async () => { },
	br = true,
}: {
	label: string,
	onAction(): void,
	br?: boolean,
}) {
	const { dispatchData } = useFetchContext()
	const [fetching, setFetching] = useState(false)

	useEffect(() => {
		let _mounted = true
		const _fetch = async () => {
			const _data = await onAction()
			if(_mounted) {
				dispatchData(_data, label)
				setFetching(false)
			}
		}

		if (fetching) {
			dispatchData('...', label)
			_fetch()
		}
		return () => { _mounted = false }
	}, [fetching, label, onAction])

	return (
		<span className='Anchor' onClick={() => setFetching(true)}>
			{label}
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
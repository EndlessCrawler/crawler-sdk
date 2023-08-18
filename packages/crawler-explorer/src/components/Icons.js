import React from 'react'
import { Icon } from 'semantic-ui-react'

export function CopyIcon({
	size = null,
	content = null, // content to copy
}) {
	function _copy() {
		navigator?.clipboard?.writeText(content)
	}
	return (
		<Icon className='Anchor InfoIcon IconClick' name='copy' size={size} onClick={() => _copy()} />
	)
}

export function LoadingIcon({
	size = null,
}) {
	return (
		<Icon
			className='InfoIcon'
			loading
			name='spinner'
			size={size}
		/>)
}

export function LinkIcon({
	size = null,
	url = null,
}) {
	const _icon = <Icon className='InfoIcon' name='hashtag' size={size} />
	if (!url) return _icon
	return (
		<a href={url} target='_blank'>
			{_icon}
		</a>
	)
}

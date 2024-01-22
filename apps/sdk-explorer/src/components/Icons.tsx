import React from 'react'
import { IconSizeProp } from 'semantic-ui-react/dist/commonjs/elements/Icon/Icon'
import { Icon } from 'semantic-ui-react'

export function CopyIcon({
	content = '', // content to copy
	size,
}: {
	content: string
	size?: IconSizeProp
}) {
	function _copy() {
		navigator?.clipboard?.writeText(content)
	}
	return (
		<Icon className='Anchor InfoIcon IconClick' name='copy' size={size} onClick={() => _copy()} />
	)
}

export function LoadingIcon({
	size,
}: {
	size?: IconSizeProp
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
	url = null,
	size,
}: {
	size?: IconSizeProp
	url: string | null
}) {
	const _icon = <Icon className='InfoIcon' name='hashtag' size={size} />
	if (!url) return _icon
	return (
		<a href={url} target='_blank'>
			{_icon}
		</a>
	)
}

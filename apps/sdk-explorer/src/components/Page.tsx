import React from 'react'

export default function Page({
	children,
}: React.PropsWithChildren) {
	return (
		<div className='Page'>
			{children}
		</div>
	)
}
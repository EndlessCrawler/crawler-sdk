import React, { useState, useEffect } from 'react'
import { formatViewData } from '@avante/crawler-api'

//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString() }

// typescript version
// (BigInt.prototype as any).toJSON = function () {
// 	return this.toString()
// }

export const useFormatter = (content) => {
	const [formatted, setFormatted] = useState('')

	useEffect(() => {
		let _mounted = true
		const _format = async () => {
			const result = await formatViewData(content)
			if (_mounted) {
				setFormatted(result)
			}
		}
		_format()
		return () => { _mounted = false }
	}, [content])

	return { formatted }
}


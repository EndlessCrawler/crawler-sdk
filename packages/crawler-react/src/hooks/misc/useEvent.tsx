import { useEffect } from 'react'
import { EventName } from '@avante/crawler-core'

export const useEvent = (
	eventName: EventName,
	handler: (data: any) => void,
	initializeHandler: boolean = true,
): void => {
	useEffect(() => {
		if (initializeHandler) {
			handler({})
		}
		document.addEventListener(eventName, handler)
		return () => {
			document.removeEventListener(eventName, handler)
		}
	}, [])
}

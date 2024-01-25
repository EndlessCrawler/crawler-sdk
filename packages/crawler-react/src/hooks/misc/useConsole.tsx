import { useLayoutEffect } from 'react'

export const useConsoleLog = (messages: any[] | null, deps: React.DependencyList) => {
	useLayoutEffect(() => {
		if (messages && messages.length > 0) {
			console.log(...messages)
		}
	}, deps)
}

export const useConsoleWarn = (messages: any[] | null, deps: React.DependencyList) => {
	useLayoutEffect(() => {
		if (messages && messages.length > 0) {
			console.warn(...messages)
		}
	}, deps)
}

export const useConsoleError = (messages: any[] | null, deps: React.DependencyList) => {
	useLayoutEffect(() => {
		if (messages && messages.length > 0) {
			console.error(...messages)
		}
	}, deps)
}

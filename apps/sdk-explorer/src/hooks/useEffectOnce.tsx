import React, { useEffect, useRef } from 'react'

export const useEffectOnce = (effect: React.EffectCallback, deps: React.DependencyList) => {
	const dataFetch = useRef(false)
	useEffect(() => {
		if (dataFetch.current) return
		dataFetch.current = true
		effect()
	}, deps)
}

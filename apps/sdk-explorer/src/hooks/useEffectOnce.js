import React, { useEffect, useRef } from 'react'

export const useEffectOnce = (effect, deps) => {
  const dataFetch = useRef(false)
  useEffect(() => {
    if (dataFetch.current) return
    dataFetch.current = true
    effect()
  }, deps)
}

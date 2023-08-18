import React, { createContext, useReducer, useContext } from 'react'

//--------------------------------
// Context
//
export const initialState = {
	url: null,
	args: [],
	params: {},
	results: {},
}
const FetchContext = createContext(initialState)

const FetchActions = {
	FETCH_URL: 'FETCH_URL',
	FETCH_RESULTS: 'FETCH_RESULTS',
	FETCH_DATA: 'FETCH_DATA',
}

//--------------------------------
// Provider
//
const FetchProvider = ({ children }) => {
	const [state, dispatch] = useReducer((state, action) => {
		let newState = { ...state }
		switch (action.type) {
			case FetchActions.FETCH_URL:
				const { url, args, params } = action.payload
				newState.url = url
				newState.args = args ?? []
				newState.params = params ?? {}
				newState.results = {}
				break
			case FetchActions.FETCH_RESULTS:
				newState.results = action.payload
				break
			case FetchActions.FETCH_DATA:
				newState.url = null
				newState.args = []
				newState.params = {}
				newState.results = action.payload
				break
			default:
				console.warn(`FetchProvider: Unknown action [${action.type}]`)
				return state
		}
		return newState
	}, initialState)

	const dispatchUrl = (url, args = [], params = {}) => {
		dispatch({
			type: FetchActions.FETCH_URL,
			payload: { url, args, params },
		})
	}

	const dispatchResults = (url) => {
		dispatch({
			type: FetchActions.FETCH_RESULTS,
			payload: url,
		})
	}

	const dispatchData = (data) => {
		dispatch({
			type: FetchActions.FETCH_DATA,
			payload: data,
		})
	}

	return (
		<FetchContext.Provider value={{ state, dispatch, dispatchUrl, dispatchResults, dispatchData }}>
			{children}
		</FetchContext.Provider>
	)
}

export { FetchProvider, FetchContext, FetchActions }


//--------------------------------
// HOOKS
//

export const useFetchContext = () => {
	return useContext(FetchContext)
}

export const useFetchState = () => {
	const { state } = useContext(FetchContext)
	return state
}


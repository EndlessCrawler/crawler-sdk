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
				newState.args = args
				newState.params = params
				break
			case FetchActions.FETCH_RESULTS:
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

	return (
		<FetchContext.Provider value={{ state, dispatchUrl, dispatchResults, dispatch }}>
			{children}
		</FetchContext.Provider>
	)
}

export { FetchProvider, FetchContext, FetchActions }


//--------------------------------
// HOOKS
//

export const useFetchState = () => {
	const { state } = useContext(FetchContext)
	return state
}


import React, { createContext, useReducer, useContext, ReactNode } from 'react'

//--------------------------------
// Context
//
export const initialState = {
	name: null,
	url: null,
	args: [],
	params: {},
	results: {},
}

export type FetchContextType = {
	state: typeof initialState
	dispatch: React.Dispatch<any>
	dispatchUrl(url: string, args?: any[], params?: any): void,
	dispatchResults(results: any): void,
	dispatchData(data: any, name: string): void,
}

const FetchContext = createContext<FetchContextType>({
	state:initialState,
	dispatch: () => null,
	dispatchUrl: () => null,
	dispatchResults: () => null,
	dispatchData: () => null,
})

enum FetchActions {
	FETCH_URL = 'FETCH_URL',
	FETCH_RESULTS = 'FETCH_RESULTS',
	FETCH_DATA = 'FETCH_DATA',
}

type ActionType = { type: FetchActions, payload: any }

//--------------------------------
// Provider
//
interface FetchProviderProps {
	children: ReactNode | JSX.Element | JSX.Element[]
}

const FetchProvider = ({ children }: FetchProviderProps) => {
	const [state, dispatch] = useReducer((state: typeof initialState, action: ActionType) => {
		let newState = { ...state }
		switch (action.type) {
			case FetchActions.FETCH_URL:
				const { url, args, params } = action.payload
				newState.name = null
				newState.url = url
				newState.args = args ?? []
				newState.params = params ?? {}
				newState.results = {}
				break
			case FetchActions.FETCH_RESULTS:
				newState.results = action.payload
				break
			case FetchActions.FETCH_DATA:
				const { data, name } = action.payload
				newState.name = name
				newState.url = null
				newState.args = []
				newState.params = {}
				newState.results = data
				break
			default:
				console.warn(`FetchProvider: Unknown action [${action.type}]`)
				return state
		}
		return newState
	}, initialState)

	const dispatchUrl = (url: string, args = [], params = {}) => {
		//@ts-ignore
		dispatch({
			type: FetchActions.FETCH_URL,
			payload: { url, args, params },
		})
	}

	const dispatchResults = (results: any) => {
		//@ts-ignore
		dispatch({
			type: FetchActions.FETCH_RESULTS,
			payload: results,
		})
	}

	const dispatchData = (data: any, name: string) => {
		//@ts-ignore
		dispatch({
			type: FetchActions.FETCH_DATA,
			payload: { data, name },
		})
	}

	return (
		//@ts-ignore
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


import React, { ReactNode, createContext, useReducer } from 'react'
import {
	ModuleInterface,
	EndlessCrawler,
} from '@avante/crawler-core'

//--------------------------------
// Constants
//
export const initialState = {
	chambers: [],
}

const CrawlerActions = {
	SET_CHAMBER: 'SET_CHAMBER',
}

//--------------------------------
// Types
//
type CrawlerStateType = {
	chambers: any[],
}

type ActionType =
	| { type: 'SET_CHAMBER', payload: any }

export type CrawlerContextType = {
	client: ModuleInterface | null
	state: CrawlerStateType
	dispatch: React.Dispatch<any>
}


//--------------------------------
// Context
//
const CrawlerContext = createContext<CrawlerContextType>({
	client: null,
	state: initialState,
	dispatch: () => null,
})

//--------------------------------
// Provider
//
interface CrawlerProviderProps {
	children: string | JSX.Element | JSX.Element[] | ReactNode
	client: ModuleInterface
}
const CrawlerProvider = ({
	children,
	client,
}: CrawlerProviderProps) => {
	const [state, dispatch] = useReducer((state: CrawlerStateType, action: ActionType) => {
		let newState = { ...state }
		switch (action.type) {
			case CrawlerActions.SET_CHAMBER: {
				// newState.chambers = action.payload
				break
			}
			default:
				console.warn(`CrawlerProvider: Unknown action [${action.type}]`)
				return state
		}
		return newState
	}, initialState)

	return (
		<CrawlerContext.Provider value={{ client, state, dispatch }}>
			{children}
		</CrawlerContext.Provider>
	)
}

export { CrawlerProvider, CrawlerContext, CrawlerActions }

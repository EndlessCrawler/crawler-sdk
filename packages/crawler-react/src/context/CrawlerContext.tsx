import React, { ReactNode, createContext, useReducer } from 'react'
import {
	ChamberDataModel,
	ModuleInterface,
} from '@avante/crawler-core'

//--------------------------------
// Constants
//
export const initialState = {
	chambers: [],
}

enum CrawlerActions {
	SET_SOMETHING = 'SET_SOMETHING',
}


//--------------------------------
// Types
//
type CrawlerStateType = typeof initialState

type ActionType =
	| { type: 'SET_SOMETHING', payload: any}

export type CrawlerContextType = {
	client: ModuleInterface | null
	state: CrawlerStateType
	dispatch: React.Dispatch<any>
	dispatchChamberData(coord: bigint, chamberData: ChamberDataModel): void,
}


//--------------------------------
// Context
//
const CrawlerContext = createContext<CrawlerContextType>({
	client: null,
	state: initialState,
	dispatch: () => null,
	dispatchChamberData: () => null,
})

//--------------------------------
// Provider
//
interface CrawlerProviderProps {
	children: ReactNode | JSX.Element | JSX.Element[]
	client: ModuleInterface
}
const CrawlerProvider = ({
	children,
	client,
}: CrawlerProviderProps) => {
	const [state, dispatch] = useReducer((state: CrawlerStateType, action: ActionType) => {
		let newState = { ...state }
		switch (action.type) {
			case CrawlerActions.SET_SOMETHING: {
				// newState.chambers = action.payload
				break
			}
			default:
				console.warn(`CrawlerProvider: Unknown action [${action.type}]`)
				return state
		}
		return newState
	}, initialState)

	const dispatchSomething = (payload: any) => {
		dispatch({
			type: CrawlerActions.SET_SOMETHING,
			payload,
		})
	}

	const dispatchChamberData = (coord: bigint, chamberData: ChamberDataModel) => {
		client.chamberData.set(coord, chamberData)
	}

	return (
		<CrawlerContext.Provider value={{ client, state, dispatch, dispatchChamberData }}>
			{children}
		</CrawlerContext.Provider>
	)
}

export { CrawlerProvider, CrawlerContext, CrawlerActions }

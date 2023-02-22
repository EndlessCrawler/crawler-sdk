import {
	ViewName,
	View,
} from './types'
import {
	getTokenIdToCoordsView,
	getChamberDataView,
} from './chambers'

const getViewNames = (): string[] => {
	return Object.keys(ViewName)
}

const getView = (viewName: ViewName): View | null => {
	if (viewName == ViewName.tokenIdToCoord) return getTokenIdToCoordsView()
	if (viewName == ViewName.chamberData) return getChamberDataView()
	return null
}

const validateView = (viewName: ViewName, view: object): boolean => {
	return typeof (view) == typeof (getView(viewName))
}

export {
	getViewNames,
	getView,
	validateView,
}

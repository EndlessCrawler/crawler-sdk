import {
	Options,
	ViewName,
	AllViews,
} from './types'
import { getChainData } from './data/loader'


//--------------------------------	
// Views
//

/** @returns all the views names **/
export const getViewNames = (): string[] => {
	return Object.keys(ViewName)
}

/** @returns all the views of the defautl or specific chain **/
export const getAllViews = (options: Options = {}): AllViews => {
	return getChainData(options)
}

/** @returns all one view of the defautl or specific chain **/
export const getView = (viewName: ViewName, options: Options = {}): AllViews[keyof AllViews] => {
	return getChainData(options)?.[viewName]
}

/** @returns validates view object **/
export const validateView = (viewName: ViewName, view: object, options: Options = {}): boolean => {
	return typeof (view) == typeof (getView(viewName, options))
}

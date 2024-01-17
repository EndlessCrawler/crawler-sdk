import {
	Options,
	ViewName,
	AllViews,
} from '../types'
import { getDataSet } from '../data/importer'


//--------------------------------	
// Views
//

/** @returns all the views names **/
export const getViewNames = (): ViewName[] => {
	return Object.keys(ViewName) as ViewName[]
}

/** @returns all the views of the defautl or specific chain **/
export const getAllViews = (options: Options = {}): AllViews => {
	return getDataSet(options)
}

/** @returns all one view of the defautl or specific chain **/
export const getView = (viewName: ViewName, options: Options = {}): AllViews[keyof AllViews] => {
	return getDataSet(options)?.[viewName]
}

/** @returns all one view of the defautl or specific chain **/
export const getViewDataCount = (viewName: ViewName, options: Options = {}): number => {
	return Object.keys(getView(viewName, options).data).length
}

/** @returns validates view object **/
export const validateView = (viewName: ViewName, view: object, options: Options = {}): boolean => {
	return typeof (view) == typeof (getView(viewName, options))
}

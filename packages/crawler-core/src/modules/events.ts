import {
	isBrowser,
	isNode,
} from '../utils'

/** @type custom event names */
export enum EventName {
	DataSetImported = 'DataSetImported',
	DataSetChanged = 'DataSetChanged',
}

//@ts-ignore
let _document: any = null
//@ts-ignore
if (isBrowser()) _document = document
//@ts-ignore
if (isNode()) _document = null

/**
 * Emits a custom event event of type {EventName}
 * @param eventName name of the event
 * @param data optional data sent with the event
 */
export const __emitEvent = (eventName: EventName, data?: any): void => {
	_document?.dispatchEvent(new CustomEvent(eventName, data))
}

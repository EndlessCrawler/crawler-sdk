import { Utils } from '../utils'

/** @type custom event names */
export enum EventName {
	DataSetImported = 'DataSetImported',
	DataSetChanged = 'DataSetChanged',
	ViewRecordChanged = 'ViewRecordChanged',
}

//@ts-ignore
let _document: any = null
//@ts-ignore
if (Utils.isBrowser()) _document = document
//@ts-ignore
if (Utils.isNode()) _document = null

/**
 * Emits a custom event event of type {EventName}
 * @param eventName name of the event
 * @param data optional data sent with the event
 */
export const __emitEvent = (eventName: EventName, data?: any): void => {
	_document?.dispatchEvent(new CustomEvent(eventName, data))
}

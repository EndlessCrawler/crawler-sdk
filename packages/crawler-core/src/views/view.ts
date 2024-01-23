import {
	Address,
	Options,
} from '../types'
import {
	ChainId,
	ContractName,
} from './chains'
import {
	ModuleId,
} from '../modules'
import {
	ModuleBase,
} from '../modules/module.base'


//--------------------------------
// Types
//

/** @type DataSet names, unique per Module */
export type DataSetName = string

/** @type all possible ViewT names */
export enum ViewName {
	tokenIdToCoord = 'tokenIdToCoord',
	chamberData = 'chamberData',
	// tokenUri = 'tokenUri',
}

/** @type (internal) used by clients for importing a chain using __importDataSets() */
export interface DataSet {
	moduleId: ModuleId
	dataSetName: DataSetName
	chainId: ChainId
	views: DataSetViews
}

/** @type generic View structure */
export type DataSetViews = {
	[key in ViewName]: View
}

/** @type generic View structure */
export type View = ViewT<ViewRecords>

/** @type typed View structure */
export interface ViewT<R extends ViewRecords> {
	metadata: ViewMetadata
	records: R
}

/** @type ViewT<> metadata */
export interface ViewMetadata {
	chainId: ChainId
	contractName?: ContractName
	contractAddress?: Address
	timestamp?: number
}




//--------------------------------
// View Access Interface
// accessed from Modules
//

/** @type a View's record key */
export type ViewKey = string | number | bigint
/** @type a View's record value */
export type ViewValue = any
/** @type a View's record (key/value pair) */
// export type ViewRecord = Partial<Record<ViewKey, ViewValue>>
export type ViewRecords = {
	[key in ViewKey as string]: ViewValue
}

export interface ViewAccess {
}

export interface ViewAccessInterface<Key extends ViewKey, Value extends ViewValue> extends ViewAccess {

	/** @type {ModuleBase} the module beig accessed */
	module: ModuleBase;
	/** @type {ViewName} the name of this view */
	viewName: ViewName;

	/**
	 * @param options the dataset
	 * @returns a full view from a dataset
	 */
	getView(options: Options): ViewT<ViewRecords>;
	/**
	 * @param options the dataset
	 * @returns the view data from a dataset
	 */
	getData(options: Options): ViewRecords;
	/**
	 * @param options the dataset
	 * @returns the number of values in a view
	 */
	getCount(options: Options): number;
	/**
	 * @param key a view data key
	 * @param options the dataset
	 * @returns a value from the view
	 */
	get(key: Key, options: Options): Value | null;
	/**
	 * @description pushes or update a value to the view
	 * @param key a view data key
	 * @param value the value to push
	 * @param options the dataset
	 */
	push(key: Key, value: Value, options: Options): void;

}

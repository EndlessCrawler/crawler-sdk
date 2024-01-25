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
	ModuleInterface,
} from '../modules'


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
export type ViewValue = any & {
	isDynamic?: boolean		// dynamic records can be updated
}
/** @type the input value that is transformed into ViewValue */
export type ViewValueModel = any
/** @type a View's record (key/value pair) */
// export type ViewRecord = Partial<Record<ViewKey, ViewValue>>
export type ViewRecords = {
	[key in ViewKey as string]: ViewValue
}

export interface ViewAccess {}

export interface ViewAccessInterface<K extends ViewKey, V extends ViewValue, M extends ViewValueModel, R extends ViewRecords> extends ViewAccess {

	/** @type {ModuleInterface} the module beig accessed */
	module: ModuleInterface;
	/** @type {ViewName} the name of this view */
	viewName: ViewName;

	/**
	 * @param options the dataset
	 * @returns a full view from a dataset
	 */
	getView(options: Options): ViewT<R>;
	/**
	 * @param options the dataset
	 * @returns the view data from a dataset
	 */
	getData(options: Options): R;
	/**
	 * @param options the dataset
	 * @returns the number of values in a view
	 */
	getCount(options: Options): number;
	/**
	 * @param key the record key
	 * @param options the dataset
	 * @returns a value from the view
	 */
	get(key: K, options: Options): V | null;
	/**
	 * @description insert or update a value to the view
	 * @param key the record key
	 * @param value the record value
	 * @param options the dataset
	 */
	set(key: K, model: M, options: Options): void;

	/**
	 * @description transforms a Model data to be stored on the View
	 * @param model data fetched on-chain
	 * @returns value to be stored on the View
	 */
	transform(model: M): V;

}

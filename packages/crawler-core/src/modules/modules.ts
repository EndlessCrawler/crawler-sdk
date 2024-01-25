import {
	Dir,
} from '../crawler'
import {
	Options,
} from "../types";
import {
	DataSet,
	DataSetName,
	DataSetViews,
	View,
	ViewAccess,
	ViewName,
	ChainId,
	ChamberDataViewAccess,
} from "../views";

/** @type existing modules */
export enum ModuleId {
	EndlessCrawler = 'ec',
	LootUnderworld = 'luw',
}


//-------------------------------
// Base Types
//
// (can be customised by Modules)
//

export type AnyCompassDir = bigint | number | null | undefined;
export type AbsentCompassDir = 0n | 0 | null | undefined;

/** @type CompassBase contains all the possible fields that can be used by Modules */
export interface CompassBase {
	north?: AnyCompassDir
	east?: AnyCompassDir
	west?: AnyCompassDir
	south?: AnyCompassDir
	yonder?: AnyCompassDir
	// introduced in Loot Underworld
	domainId?: AnyCompassDir
	tokenId?: AnyCompassDir
	over?: AnyCompassDir
	under?: AnyCompassDir
}

export const _slugSeparators = [null, '', ',', '.', ';', '-'] as const;
export const _defaultSlugSeparator = ',';
export type SlugSeparator = typeof _slugSeparators[number];


//-------------------------------
// Module Interface
//
export type ModuleViews = {
	[key in ViewName]?: ViewAccess
}

/** ModuleInterface defines all the properties of a Module */
export interface ModuleInterface {

	//-------------------------
	// Module properties
	//
	/** @type {ModuleId} the module type */
	moduleId: ModuleId;
	/** @type {string} the module description */
	moduleDescription: string;

	/** @type the ViewAccessInterface for all views included in this module */
	moduleViews: ModuleViews;
	/** @type the main ChamberData view, common to all modules */
	chamberData: ChamberDataViewAccess;

	/** @type all possible chamber directions */
	chamberDirections: Dir[];


	//-------------------------
	//  DataSets importer
	//
	/** import DataSets for use, must be all of the same Module */
	importDataSets(datasets: DataSet[]): void;
	/** set options.dataSetName as the current DataSet */
	setCurrentDataSet(options?: Options): void;
	/** @returns all the imported DataSet names **/
	getCurrentDataSetName(options?: Options): DataSetName;
	/** @returns all the imported DataSet names **/
	getDataSetNames(options?: Options): DataSetName[];
	/** @returns a full imported DataSet */
	getDataSet(options?: Options): DataSet;
	/** @returns options.chainId or the current dataset ChainId */
	resolveChainId(options?: Options): ChainId;
	/** @returns a blank DataSet */
	createBlankDataSet(select?: boolean): DataSet;


	//-------------------------
	//  Views
	//
	/** @returns all the views of the defautl or specific chain **/
	getAllViews(options?: Options): DataSetViews;
	/** @returns true if this modulke includes the {ViewName} **/
	includesView(viewName: ViewName): boolean;
	/** @returns all the views names **/
	getViewNames(): ViewName[];
	/** @returns all one view of the defautl or specific chain **/
	getView(viewName: ViewName, options?: Options): View;
	/** @returns all one view of the defautl or specific chain **/
	getViewRecordCount(viewName: ViewName, options?: Options): number;
	/** @returns validates view object **/
	validateView(viewName: ViewName, view: object, options?: Options): boolean;



	//-------------------------
	// Compass
	//
	// generic methods (implemented by ModuleBase)
	//
	/** @returns the Compass without all the empty fields, or null if is invalid */
	minifyCompass(compass: CompassBase | null): CompassBase | null;
	/** @returns true if both Compass are equal */
	compassEquals(a: CompassBase | null, b: CompassBase | null): boolean;
	/** @returns true if Coord is valid */
	validateCoord(coord: bigint): boolean;
	/** @returns true if slug is valid */
	validateSlug(slug: string | null): boolean;
	/** @returns the Coord (bigint) converted to a readable Slug (string) */
	coordToSlug(coord: bigint, separator?: SlugSeparator): string | null;
	/** @returns the Slug (string) converted to a Coord (bigint) */
	slugToCoord(slug: string | null): bigint;
	//
	// abstract methods (must be implemented by Modules)
	//
	/** @returns true if the Compass is valid */
	validateCompass(compass: CompassBase | null): boolean;
	/** @returns the Compass, if is valid */
	validatedCompass(compass: CompassBase | null): CompassBase | null;
	/** @returns the Compass offeset by 1 chamber in direction Dir */
	offsetCompass(compass: CompassBase | null, dir: Dir): CompassBase | null;
	/** @returns the Coord (bigint) offeset by 1 chamber in direction Dir */
	offsetCoord(coord: bigint, dir: Dir): bigint;
	/** @returns the Coord (bigint) converted to a Compass */
	coordToCompass(coord: bigint): CompassBase | null;
	/** @returns the Compass converted to a Coord (bigint) */
	compassToCoord(compass: CompassBase | null): bigint;
	/** @returns the Compass converted to a readable Slug (string) */
	compassToSlug(compass: CompassBase | null, separator?: SlugSeparator): string | null;
	/** @returns the Slug (string) converted to a Compass */
	slugToCompass(slug: string | null): CompassBase | null;

}


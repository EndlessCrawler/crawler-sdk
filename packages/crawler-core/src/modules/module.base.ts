import {
	ChainId,
	Options,
} from "../types"
import {
	DataSet,
	DataSetViews,
	View,
	ViewName,
} from "../views"
import {
	ModuleId,
	ModuleInterface,
	ModuleViews,
	CompassBase,
	SlugSeparator,
	_defaultSlugSeparator,
} from "./modules"
import {
	__getDataSet,
	__importDataSets,
	__resolveChainId,
	__setCurrentDataSet,
} from "./importer"


/**
 * ModuleBase contains generic functions that can be used by any Module
 * Implementations of ModuleInterface must extend ModuleBase
 */
export abstract class ModuleBase implements Partial<ModuleInterface> {

	_options(options: Options = {}): Options {
		return {
			...options,
			moduleId: this.moduleId,
		}
	}

	//-------------------------
	//  DataSets
	//
	importDataSets(datasets: DataSet[]): void {
		__importDataSets(datasets)
	}
	setCurrentDataSet(options: Options): void {
		__setCurrentDataSet(this._options(options))
	}
	resolveChainId(options: Options = {}): ChainId {
		return __resolveChainId(this._options(options))
	}
	getDataSet(options: Options = {}): DataSet {
		return __getDataSet(this._options(options))
	}


	//-------------------------
	//  Views
	//
	abstract moduleViews: ModuleViews;
	getAllViews(options: Options = {}): DataSetViews {
		return this.getDataSet(options).views
	}
	includesView(viewName: ViewName): boolean {
		return Object.keys(this.moduleViews).includes(viewName)
	}
	getViewNames(): ViewName[] {
		return Object.keys(this.moduleViews) as ViewName[]
	}
	getView(viewName: ViewName, options: Options = {}): View {
		return this.getDataSet(options)?.views?.[viewName] ?? {}
	}
	getViewDataCount(viewName: ViewName, options: Options = {}): number {
		if (!this.includesView(viewName)) return 0
		return Object.keys(this.getView(viewName, options).data).length
	}
	validateView(viewName: ViewName, view: object, options: Options = {}): boolean {
		if (!this.includesView(viewName)) return false
		return typeof (view) == typeof (this.getView(viewName, options))
	}


	//-------------------------
	// Compass
	//
	_minifyCompass(compass: CompassBase | null): CompassBase | null {
		if (!compass || !this.validateCompass(compass)) {
			return null
		}
		return Object.keys(compass).reduce((acc, key) => {
			const _key = key as keyof CompassBase
			if (compass[_key]) acc[_key] = compass[_key]
			return acc
		}, {} as CompassBase)
	}
	_compassEquals(a: CompassBase | null, b: CompassBase | null): boolean {
		const aa = this._minifyCompass(a)
		const bb = this._minifyCompass(b)
		if (!aa || !bb) return false
		return Object.keys(aa).reduce((acc, key) => {
			if (!acc) return false
			const _key = key as keyof CompassBase
			return aa[_key] === bb[_key]
		}, true)
	}
	validateCoord(coord: bigint): boolean {
		return this.coordToCompass(coord) != null
	}
	validateSlug(slug: string | null): boolean {
		return this.slugToCompass(slug) != null
	}
	coordToSlug(coord: bigint, separator: SlugSeparator = _defaultSlugSeparator): string | null {
		return this.compassToSlug(this.coordToCompass(coord), separator)
	}
	slugToCoord(slug: string | null): bigint {
		return this.compassToCoord(this.slugToCompass(slug))
	}
	// referenced by this, to be implemented by Modules
	abstract moduleId: ModuleId;
	abstract validateCompass(compass: CompassBase | null): boolean;
	abstract validatedCompass(compass: CompassBase | null): CompassBase | null;
	abstract coordToCompass(coord: bigint): CompassBase | null;
	abstract slugToCompass(slug: string | null): CompassBase | null;
	abstract compassToCoord(compass: CompassBase | null): bigint;
	abstract compassToSlug(compass: CompassBase | null, separator?: SlugSeparator): string | null;




	
}

import { AllViews, ChainId, DataSet, Options } from ".."
import { __getDataSet, __importDataSets, __resolveChainId, __setCurrentDataSet } from "./importer"
import {
	ModuleInterface,
	CompassBase,
	SlugSeparator,
	defaultSlugSeparator,
	ModuleId,
} from "./modules"


/**
 * ModuleBase contains generic functions that can be used by any Module
 * Implementations of ModuleInterface must extend ModuleBase
 */
export abstract class ModuleBase implements Partial<ModuleInterface> {



	//-------------------------
	//  DataSets
	//
	importDataSets(datasets: DataSet[]): void {
		__importDataSets(datasets)
	}
	setCurrentDataSet(options: Options): void {
		__setCurrentDataSet({
			...options,
			moduleId: this.moduleId,
		})
	}
	resolveChainId(options: Options = {}): ChainId {
		return __resolveChainId({
			...options,
			moduleId: this.moduleId,
		})
	}
	getDataSet(options: Options = {}): AllViews {
		return __getDataSet({
			...options,
			moduleId: this.moduleId,
		})
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
	coordToSlug(coord: bigint, separator: SlugSeparator = defaultSlugSeparator): string | null {
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

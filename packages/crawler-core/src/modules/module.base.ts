import {
	ModuleInterface,
	CompassBase,
} from "./modules"


//-------------------------------
// Base Module implementation
//

/**
 * ModuleBase contains generic functions that can be used by any Module
 * Implementations of ModuleInterface must extend ModuleBase
 */
export abstract class ModuleBase implements Partial<ModuleInterface> {

	minifyCompas(compass: CompassBase | null): CompassBase | null {
		if (!compass || !this.validateCompass(compass)) {
			return null
		}
		return Object.keys(compass).reduce((acc, key) => {
			const _key = key as keyof CompassBase
			if (compass[_key]) acc[_key] = compass[_key]
			return acc
		}, {} as CompassBase)
	}

	// referenced by ModuleBase that need to be implemented
	abstract validateCompass(compass: CompassBase | null): boolean;
}

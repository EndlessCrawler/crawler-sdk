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


export type AbsentCompassDir = 0 | null | undefined
export type AnyCompassDir = number | bigint | null | undefined

/** @type CompassBase contains all the possible fields that can be used by Modules */
export interface CompassBase {
	domainId?: AnyCompassDir
	tokenId?: AnyCompassDir
	over?: AnyCompassDir
	under?: AnyCompassDir
	north?: AnyCompassDir
	east?: AnyCompassDir
	west?: AnyCompassDir
	south?: AnyCompassDir
}


//-------------------------------
// Module Interface
//

/** ModuleInterface defines all the properties of a Module */
export interface ModuleInterface {
	
	//
	// Module properties
	//

	/** @type {ModuleId} the module type */
	moduleId: ModuleId;
	/** @type {string} the module description */
	moduleDescription: string;

	//
	// abstract methods (must be implemented by Modules)
	//

	/** @returns true if the Compass is valid */
	validateCompass(compass: CompassBase | null): boolean;

	//
	// generic methods (implemented by ModuleBase)
	//

	/** @returns the Compass without all the empty fields, or null if is invalid */
	minifyCompas(compass: CompassBase | null): CompassBase | null;
}


//-------------------------------
// Base Module implementation
//

/**
 * ModuleBase contains generic functions that can be used by any Module
 * Implementations of ModuleInterface must extend ModuleBase
 */
export abstract class ModuleBase implements Partial<ModuleInterface> {

	/** @returns the Compass without all the empty fields, or null if is invalid */
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

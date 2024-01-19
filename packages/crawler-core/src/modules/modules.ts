import {
	Dir,
} from ".."

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
	// introduced in Loot Underworld
	domainId?: AnyCompassDir
	tokenId?: AnyCompassDir
	over?: AnyCompassDir
	under?: AnyCompassDir
}

export const slugSeparators = [null, '', ',', '.', ';', '-'] as const;
export const defaultSlugSeparator = ',';
export type SlugSeparator = typeof slugSeparators[number];


//-------------------------------
// Module Interface
//

/** ModuleInterface defines all the properties of a Module */
export interface ModuleInterface {
	
	//
	// properties
	//

	/** @type {ModuleId} the module type */
	moduleId: ModuleId;
	/** @type {string} the module description */
	moduleDescription: string;

	//
	// abstract methods
	// (must be implemented by Modules)
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
	compassToSlug(compass: CompassBase | null, yonder?: number, separator?: SlugSeparator): string | null;
	/** @returns the Slug (string) converted to a Compass */
	slugToCompass(slug: string | null): CompassBase | null;

	//
	// generic methods
	// (implemented by ModuleBase)
	//

	/** @returns the Compass without all the empty fields, or null if is invalid */
	minifyCompass(compass: CompassBase | null): CompassBase | null;
	/** @returns true if both Compass are equal */
	compassEquals(a: CompassBase | null, b: CompassBase | null): boolean;
	/** @returns true if Coord is valid */
	validateCoord (coord: bigint): boolean;
	/** @returns true if slug is valid */
	validateSlug (slug: string | null): boolean;
	/** @returns the Coord (bigint) converted to a readable Slug (string) */
	coordToSlug(coord: bigint, yonder?: number, separator?: SlugSeparator): string | null;
	/** @returns the Slug (string) converted to a Coord (bigint) */
	slugToCoord(slug: string | null): bigint;

}


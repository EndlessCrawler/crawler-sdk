import {
	Dir,
} from ".."
import {
	ModuleInterface,
	CompassBase,
	SlugSeparator,
	defaultSlugSeparator,
	AnyCompassDir,
} from "./modules"


//-------------------------------
// Base Module implementation
//

/**
 * ModuleBase contains generic functions that can be used by any Module
 * Implementations of ModuleInterface must extend ModuleBase
 */
export abstract class ModuleBase implements Partial<ModuleInterface> {

	minifyCompass(compass: CompassBase | null): CompassBase | null {
		if (!compass || !this.validateCompass(compass)) {
			return null
		}
		return Object.keys(compass).reduce((acc, key) => {
			const _key = key as keyof CompassBase
			if (compass[_key]) acc[_key] = compass[_key]
			return acc
		}, {} as CompassBase)
	}

	compassEquals(a: CompassBase | null, b: CompassBase | null): boolean {
		const aa = this.minifyCompass(a)
		const bb = this.minifyCompass(b)
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

	coordToSlug(coord: bigint, yonder: number = 0, separator: SlugSeparator = defaultSlugSeparator): string | null {
		return this.compassToSlug(this.coordToCompass(coord), yonder, separator)
	}

	slugToCoord(slug: string | null): bigint {
		return this.compassToCoord(this.slugToCompass(slug))
	}

	// referenced by this, to be implemented by Module
	abstract validateCompass(compass: CompassBase | null): boolean;
	abstract validatedCompass(compass: CompassBase | null): CompassBase | null;
	abstract coordToCompass(coord: bigint): CompassBase | null;
	abstract slugToCompass(slug: string | null): CompassBase | null;
	abstract compassToCoord(compass: CompassBase | null): bigint;
	abstract compassToSlug(compass: CompassBase | null, yonder?: number, separator?: SlugSeparator): string | null;
}

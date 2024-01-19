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

	offsetCompass(compass: CompassBase | null, dir: Dir): CompassBase | null {
		if (!compass) return null
		const _add = (v: AnyCompassDir) => (v ? v + 1 : 1)
		const _sub = (v: AnyCompassDir) => (v && v > 1 ? v - 1 : 0)
		let result = { ...compass }
		if (dir == Dir.North) {
			result.south = _sub(result.south)
			if (!result.south) result.north = _add(result.north)
		} else if (dir == Dir.South) {
			result.north = _sub(result.north)
			if (!result.north) result.south = _add(result.south)
		} else if (dir == Dir.East) {
			result.west = _sub(result.west)
			if (!result.west) result.east = _add(result.east)
		} else if (dir == Dir.West) {
			result.east = _sub(result.east)
			if (!result.east) result.west = _add(result.west)
		} else if (dir == Dir.Over) {
			result.under = _sub(result.under)
			if (!result.under) result.over = _add(result.over)
		} else if (dir == Dir.Under) {
			result.over = _sub(result.over)
			if (!result.over) result.under = _add(result.under)
		}
		return this.validatedCompass(result)
	}

	validateCoord(coord: bigint): boolean {
		return this.coordToCompass(coord) != null
	}

	validateSlug(slug: string | null): boolean {
		return this.slugToCompass(slug) != null
	}

	coordToSlug(coord: bigint, yonder: number, separator: SlugSeparator = defaultSlugSeparator): string | null {
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
	abstract compassToSlug(compass: CompassBase | null, yonder: number, separator: SlugSeparator): string | null;
}

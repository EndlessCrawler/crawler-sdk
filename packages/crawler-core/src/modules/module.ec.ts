import {
	Dir,
} from '../crawler'
import {
	ChamberDataViewAccess,
	TokenIdToCoordViewAccess,
} from '../views'
import {
	AbsentCompassDir,
	CompassBase,
	ModuleId,
	ModuleInterface,
	ModuleViews,
	SlugSeparator,
	_defaultSlugSeparator,
	_slugSeparators,
} from './modules'
import {
	ModuleBase,
} from './module.base'

export namespace EndlessCrawler {

	/** @type: {ModuleId} required namespace Id */
	export const Id: ModuleId = ModuleId.EndlessCrawler

	//-------------------------------
	// Types
	//

	export type CompassNEWS = Pick<CompassBase, 'north' | 'east' | 'west' | 'south' | 'yonder'>
	export interface CompassNE extends CompassNEWS {
		north: bigint
		east: bigint
		west?: AbsentCompassDir
		south?: AbsentCompassDir
		yonder?: bigint // optional
	}
	export interface CompassNW extends CompassNEWS {
		north: bigint
		east?: AbsentCompassDir
		west: bigint
		south?: AbsentCompassDir
		yonder?: bigint // optional
	}
	export interface CompassSE extends CompassNEWS {
		north?: AbsentCompassDir
		east: bigint
		west?: AbsentCompassDir
		south: bigint
		yonder?: bigint // optional
	}
	export interface CompassSW extends CompassNEWS {
		north?: AbsentCompassDir
		east?: AbsentCompassDir
		west: bigint
		south: bigint
		yonder?: bigint // optional
	}
	/** @type {Compass} Coordinates of a chamber in NEWS format */
	export type Compass = (CompassNE | CompassNW | CompassSE | CompassSW)


	//-----------------------------------
	// coord (uint256 as bigint)
	//
	// A Chamber's coordinate is designated by North, East, West, South values (uint64)
	// This 'Compass' is stored into an uint256 like this...
	//
	// North            West             East             South
	// ffffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffff
	//
	// Directions are ALWAYS in NEWS order (North, East, West, South)
	// just because it is catchy and easy to remember
	//

	// The maximum value in any Compass direction
	export const CoordMax = 0xffffffffffffffffn // 64-bit, 18446744073709551615n, 18_446_744_073_709_551_615

	export const CoordOffset = {
		North: 192n,
		East: 128n,
		West: 64n,
		South: 0n,
	}

	// coord bit mask for each Compass direction
	export const CoordMask = {
		// mask of each direction inside uint256
		North: (CoordMax << CoordOffset.North),
		East: (CoordMax << CoordOffset.East),
		West: (CoordMax << CoordOffset.West),
		South: CoordMax, // << CoordOffset.South
		// inverted masks
		InvNorth: ~(CoordMax << CoordOffset.North),
		InvEast: ~(CoordMax << CoordOffset.East),
		InvWest: ~(CoordMax << CoordOffset.West),
		InvSouth: ~CoordMax, // << CoordOffset.South
	}

	// The number 1 in each Compass direction
	export const CoordOne = {
		North: (1n << CoordOffset.North),
		East: (1n << CoordOffset.East),
		West: (1n << CoordOffset.West),
		South: 1n, // << CoordOffset.South
	}


	//-------------------------------
	// Module implementation
	//
	export class Module extends ModuleBase implements ModuleInterface {

		constructor() {
			super()
			this.tokenIdToCoord = new TokenIdToCoordViewAccess(this)
			this.chamberData = new ChamberDataViewAccess(this)
			this.moduleViews = {
				[this.tokenIdToCoord.viewName]: this.tokenIdToCoord,
				[this.chamberData.viewName]: this.chamberData,
			}
			this.chamberDirections = [Dir.North, Dir.East, Dir.West, Dir.South]
		}

		//------------------------------
		// Views
		//
		moduleViews: ModuleViews
		tokenIdToCoord: TokenIdToCoordViewAccess;
		chamberData: ChamberDataViewAccess;
		chamberDirections: Dir[];


		//------------------------------
		// Module implementation
		//

		moduleId = Id;
		moduleDescription = 'Endless Crawler from Ethereum';

		validateCompass(compass: Compass | null): boolean {
			if (!compass) return false
			const hasNorth = (compass.north && compass.north > 0n)
			const hasSouth = (compass.south && compass.south > 0n)
			const hasEast = (compass.east && compass.east > 0n)
			const hasWest = (compass.west && compass.west > 0n)
			if ((hasNorth && hasSouth)
				|| (!hasNorth && !hasSouth)
				|| (hasEast && hasWest)
				|| (!hasEast && !hasWest)
			) return false
			return true
		}

		validatedCompass(compass: Compass | null): Compass | null {
			return this.validateCompass(compass) ? compass : null
		}

		minifyCompass(compass: Compass | null): Compass | null {
			return super._minifyCompass(compass) as Compass
		}

		compassEquals(a: CompassBase | null, b: CompassBase | null): boolean {
			return super._compassEquals(a, b)
		}

		offsetCompass(compass: Compass | null, dir: Dir): Compass | null {
			if (!compass) return null
			const _add = (v: bigint | AbsentCompassDir) => (!v ? 1n : v < CoordMax ? v + 1n : v)
			const _sub = (v: bigint | AbsentCompassDir) => (!v ? 0n : v - 1n)
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
			}
			return this.validatedCompass(result)
		}

		offsetCoord(coord: bigint, dir: Dir): bigint {
			if (dir == Dir.North) {
				if ((coord & CoordMask.South) > CoordOne.South) return coord - CoordOne.South // --South
				if ((coord & CoordMask.North) != CoordMask.North) return (coord & CoordMask.InvSouth) + CoordOne.North // ++North
			} else if (dir == Dir.East) {
				if ((coord & CoordMask.West) > CoordOne.West) return coord - CoordOne.West // --West
				if ((coord & CoordMask.East) != CoordMask.East) return (coord & CoordMask.InvWest) + CoordOne.East // ++East
			} else if (dir == Dir.West) {
				if ((coord & CoordMask.East) > CoordOne.East) return coord - CoordOne.East // --East
				if ((coord & CoordMask.West) != CoordMask.West) return (coord & CoordMask.InvEast) + CoordOne.West // ++West
			} else if (dir == Dir.South) {
				if ((coord & CoordMask.North) > CoordOne.North) return coord - CoordOne.North // --North
				if ((coord & CoordMask.South) != CoordMask.South) return (coord & CoordMask.InvNorth) + CoordOne.South // ++South
			}
			return coord
		}

		coordToCompass(coord: bigint): Compass | null {
			if (coord == 0n) return null
			const result = {
				north: ((coord >> CoordOffset.North) & CoordMax),
				east: ((coord >> CoordOffset.East) & CoordMax),
				west: ((coord >> CoordOffset.West) & CoordMax),
				south: (coord & CoordMax),
			} as Compass
			return this.validatedCompass(result)
		}

		compassToCoord(compass: Compass | null): bigint {
			let result = 0n
			if (compass && this.validateCompass(compass)) {
				if (compass.north && compass.north > 0n) result += (compass.north << CoordOffset.North)
				if (compass.east && compass.east > 0n) result += (compass.east << CoordOffset.East)
				if (compass.west && compass.west > 0n) result += (compass.west << CoordOffset.West)
				if (compass.south && compass.south > 0n) result += (compass.south)
			}
			return result
		}

		compassToSlug(compass: Compass | null, separator: SlugSeparator = _defaultSlugSeparator): string | null {
			let result = ''
			if (compass && this.validateCompass(compass)) {
				if (compass.north && compass.north > 0n) result += `N${compass.north}`
				if (compass.south && compass.south > 0n) result += `S${compass.south}`
				if (separator) result += separator
				if (compass.east && compass.east > 0n) result += `E${compass.east}`
				if (compass.west && compass.west > 0n) result += `W${compass.west}`
				if (compass.yonder && compass.yonder > 0) {
					if (separator) result += separator
					result += `Y${compass.yonder}`
				}
			}
			return result
		}

		// TODO: make this generic?
		slugToCompass(slug: string | null): Compass | null {
			if (!slug) return null
			// const _regex = /^[NnSs]\d+.{0,1}[EeWw]\d+$/g // NEWS
			const _regex = /^[NnSs]\d+.{0,1}[EeWw]\d+(?:.{0,1}[Yy]\d+)?$/g // NEWS[Y]
			if (!_regex.exec(slug)) return null
			// match each direction
			const north = /[Nn]\d+/g.exec(slug)
			const east = /[Ee]\d+/g.exec(slug)
			const west = /[Ww]\d+/g.exec(slug)
			const south = /[Ss]\d+/g.exec(slug)
			const yonder = /[Yy]\d+/g.exec(slug)
			// validate separator (will be a number if no separator)
			const _slugSeparatorTester: string = _slugSeparators.join('') + '0123456789';
			const separatorIndex: number = (east?.index ?? west?.index ?? 0) - 1
			if (separatorIndex < 0 || !_slugSeparatorTester.includes(slug.charAt(separatorIndex))) return null
			// build compass
			let result: any = {}
			if (north) result.north = BigInt(north[0].slice(1))
			if (east) result.east = BigInt(east[0].slice(1))
			if (west) result.west = BigInt(west[0].slice(1))
			if (south) result.south = BigInt(south[0].slice(1))
			if (yonder) result.yonder = BigInt(yonder[0].slice(1))
			return this.validatedCompass(result)
		}

	}

} // namespace EndlessCrawler

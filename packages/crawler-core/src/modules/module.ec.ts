import {
	Dir,
} from ".."
import {
	CompassBase,
	ModuleInterface,
	ModuleId,
	AbsentCompassDir,
	SlugSeparator,
	defaultSlugSeparator,
	slugSeparatorTester,
} from './modules'
import { ModuleBase } from './module.base'

export namespace EndlessCrawler {

	/** @type: {ModuleId} required namespace Id */
	export const Id: ModuleId = ModuleId.EndlessCrawler

	//-------------------------------
	// Types
	//

	export type CompassNEWS = Pick<CompassBase, 'north' | 'east' | 'west' | 'south'>
	export interface CompassNE extends CompassNEWS {
		north: number
		east: number
		west?: AbsentCompassDir
		south?: AbsentCompassDir
	}
	export interface CompassNW extends CompassNEWS {
		north: number
		east?: AbsentCompassDir
		west: number
		south?: AbsentCompassDir
	}
	export interface CompassSE extends CompassNEWS {
		north?: AbsentCompassDir
		east: number
		west?: AbsentCompassDir
		south: number
	}
	export interface CompassSW extends CompassNEWS {
		north?: AbsentCompassDir
		east?: AbsentCompassDir
		west: number
		south: number
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
		}

		moduleId = Id;
		moduleDescription = 'Endless Crawler from Ethereum';

		validateCompass(compass: Compass | null): boolean {
			if (!compass) return false
			const hasNorth = (compass.north && compass.north > 0)
			const hasSouth = (compass.south && compass.south > 0)
			const hasEast = (compass.east && compass.east > 0)
			const hasWest = (compass.west && compass.west > 0)
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
				north: Number((coord >> CoordOffset.North) & CoordMax),
				east: Number((coord >> CoordOffset.East) & CoordMax),
				west: Number((coord >> CoordOffset.West) & CoordMax),
				south: Number(coord & CoordMax),

			} as Compass
			return this.validatedCompass(result)
		}

		compassToCoord(compass: Compass | null): bigint {
			let result = 0n
			if (compass && this.validateCompass(compass)) {
				if (compass.north && compass.north > 0) result += BigInt(compass.north) << CoordOffset.North
				if (compass.east && compass.east > 0) result += BigInt(compass.east) << CoordOffset.East
				if (compass.west && compass.west > 0) result += BigInt(compass.west) << CoordOffset.West
				if (compass.south && compass.south > 0) result += BigInt(compass.south)
			}
			return result
		}

		compassToSlug(compass: Compass | null, yonder: number = 0, separator: SlugSeparator = defaultSlugSeparator): string | null {
			let result = ''
			if (compass && this.validateCompass(compass)) {
				if (compass.north && compass.north > 0) result += `N${compass.north}`
				if (compass.south && compass.south > 0) result += `S${compass.south}`
				if (separator) result += separator
				if (compass.east && compass.east > 0) result += `E${compass.east}`
				if (compass.west && compass.west > 0) result += `W${compass.west}`
				if (yonder) {
					if (separator) result += separator
					result += `Y${yonder}`
				}
			}
			return result
		}

		// TODO: make this generic?
		slugToCompass(slug: string | null): Compass | null {
			if (!slug) return null
			if (!/^[NnSs]\d+.{0,1}[EeWw]\d+$/g.exec(slug)) return null
			// match each direction
			const north = /[Nn]\d+/g.exec(slug)
			const east = /[Ee]\d+/g.exec(slug)
			const west = /[Ww]\d+/g.exec(slug)
			const south = /[Ss]\d+/g.exec(slug)
			// validate separator (will be a number if no separator)
			const separatorIndex: number = (east?.index ?? west?.index ?? 0) - 1
			if (separatorIndex < 0 || !slugSeparatorTester.includes(slug.charAt(separatorIndex))) return null
			// build compass
			let result: any = {}
			if (north) result.north = parseInt(north[0].slice(1))
			if (east) result.east = parseInt(east[0].slice(1))
			if (west) result.west = parseInt(west[0].slice(1))
			if (south) result.south = parseInt(south[0].slice(1))
			return this.validatedCompass(result)
		}

	}

} // namespace EndlessCrawler

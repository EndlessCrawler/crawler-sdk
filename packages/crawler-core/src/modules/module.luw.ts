import { Dir } from '../crawl'
import {
	MissingImplementationError,
} from '../types'
import {
	ChamberDataViewAccess,
} from '../views'
import {
	AbsentCompassDir,
	CompassBase,
	ModuleId,
	ModuleInterface,
	ModuleViews,
	SlugSeparator,
	_defaultSlugSeparator
} from './modules'
import {
	ModuleBase,
} from './module.base'

export namespace LootUnderworld {

	/** @type: {ModuleId} required namespace Id */
	export const Id: ModuleId = ModuleId.LootUnderworld

	//-------------------------------
	// Types
	//

	export enum Domain {
		Realms = 1,
		// CryptsAndCaverns = 2,
	}

	export const DomainTokenCount = {
		[Domain.Realms]: 8000,
	}

	export interface Compass extends CompassBase {
		domainId?: Domain
		tokenId?: number
		over?: number
		under?: number
		north?: number
		east?: number
		west?: number
		south?: number
		yonder?: number // optional
	}


	//-----------------------------------
	// coord (uint128 as bigint)
	//
	// Loot Underworld coordinates is designated by North, East, West, South values (uint16)
	// This 'Compass' is stored into an uint128 like this...
	//
	// North            West             East             South
	// ffffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffff
	//

	// The maximum value in any Compass direction
	export const CoordMax = 0xffffn // 16-bit, 65535n, 65_535

	export const CoordOffset = {
		DomainId: 112n,
		TokenId: 96n,
		Over: 80n,
		Under: 64n,
		North: 48n,
		East: 32n,
		West: 16n,
		South: 0n,
	}

	// coord bit mask for each Compass direction
	export const CoordMask = {
		// mask of each direction inside uint128
		DomainId: (CoordMax << CoordOffset.DomainId),
		TokenId: (CoordMax << CoordOffset.TokenId),
		Over: (CoordMax << CoordOffset.Over),
		Under: (CoordMax << CoordOffset.Under),
		North: (CoordMax << CoordOffset.North),
		East: (CoordMax << CoordOffset.East),
		West: (CoordMax << CoordOffset.West),
		South: CoordMax, // << CoordOffset.South
		// inverted masks
		InvDomainId: ~(CoordMax << CoordOffset.DomainId),
		InvTokenId: ~(CoordMax << CoordOffset.TokenId),
		InvOver: ~(CoordMax << CoordOffset.Over),
		InvUnder: ~(CoordMax << CoordOffset.Under),
		InvNorth: ~(CoordMax << CoordOffset.North),
		InvEast: ~(CoordMax << CoordOffset.East),
		InvWest: ~(CoordMax << CoordOffset.West),
		InvSouth: ~CoordMax, // << CoordOffset.South
	}

	// The number 1 in each Compass direction
	export const CoordOne = {
		DomainId: (1n << CoordOffset.DomainId),
		TokenId: (1n << CoordOffset.TokenId),
		Over: (1n << CoordOffset.Over),
		Under: (1n << CoordOffset.Under),
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
			this.chamberData = new ChamberDataViewAccess(this)
			this.moduleViews = {
				[this.chamberData.viewName]: this.chamberData,
			}
		}

		//------------------------------
		// Views
		//
		moduleViews: ModuleViews
		chamberData: ChamberDataViewAccess;

		moduleId = Id;
		moduleDescription = 'Loot Underworld from Starknet Dojo';

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
			if (compass.tokenId &&
				(compass.domainId == null || compass.tokenId < 1 || compass.tokenId > DomainTokenCount[compass.domainId])
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
			const _add = (v: number | AbsentCompassDir) => (!v ? 1 : v < CoordMax ? v + 1 : v)
			const _sub = (v: number | AbsentCompassDir) => (!v ? 0 : v - 1)
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
			} else if (dir == Dir.Over) {
				if ((coord & CoordMask.Under) > CoordOne.Under) return coord - CoordOne.Under // --Under
				if ((coord & CoordMask.Over) != CoordMask.Over) return (coord & CoordMask.InvUnder) + CoordOne.Over // ++Over
			} else if (dir == Dir.Under) {
				if ((coord & CoordMask.Over) > CoordOne.Over) return coord - CoordOne.Over // --Over
				if ((coord & CoordMask.Under) != CoordMask.Under) return (coord & CoordMask.InvOver) + CoordOne.Under // ++Under
			}
			return coord
		}

		coordToCompass(coord: bigint): Compass | null {
			if (coord == 0n) return null
			const result = {
				domainId: Number((coord >> CoordOffset.DomainId) & CoordMax),
				tokenId: Number((coord >> CoordOffset.TokenId) & CoordMax),
				over: Number((coord >> CoordOffset.Over) & CoordMax),
				under: Number((coord >> CoordOffset.Under) & CoordMax),
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
				if (compass.domainId && compass.domainId > 0) result += BigInt(compass.domainId) << CoordOffset.DomainId
				if (compass.tokenId && compass.tokenId > 0) result += BigInt(compass.tokenId) << CoordOffset.TokenId
				if (compass.over && compass.over > 0) result += BigInt(compass.over) << CoordOffset.Over
				if (compass.under && compass.under > 0) result += BigInt(compass.under) << CoordOffset.Under
				if (compass.north && compass.north > 0) result += BigInt(compass.north) << CoordOffset.North
				if (compass.east && compass.east > 0) result += BigInt(compass.east) << CoordOffset.East
				if (compass.west && compass.west > 0) result += BigInt(compass.west) << CoordOffset.West
				if (compass.south && compass.south > 0) result += BigInt(compass.south)
			}
			return result
		}

		compassToSlug(compass: Compass | null, separator: SlugSeparator = _defaultSlugSeparator): string | null {
			let result = ''
			if (compass && this.validateCompass(compass)) {
				if (compass.tokenId) {
					result += `#${compass.tokenId}`
					if (separator) result += separator
				}
				if (compass.over || compass.under) {
					if (compass.over && compass.over > 0) result += `O${compass.over}`
					if (compass.under && compass.under > 0) result += `U${compass.under}`
					if (separator) result += separator
				}
				if (compass.north && compass.north > 0) result += `N${compass.north}`
				if (compass.south && compass.south > 0) result += `S${compass.south}`
				if (separator) result += separator
				if (compass.east && compass.east > 0) result += `E${compass.east}`
				if (compass.west && compass.west > 0) result += `W${compass.west}`
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
			throw (new MissingImplementationError('LootUnderworld.Module.slugToCompass()'))
		}
	}

} // namespace LootUnderworld

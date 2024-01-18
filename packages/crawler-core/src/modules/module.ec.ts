

import {
	CompassBase,
	ModuleBase,
	ModuleInterface,
	ModuleId,
	AbsentCompassDir,
} from './modules'

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



	//-------------------------------
	// Module implementation
	//
	export class Module extends ModuleBase implements ModuleInterface {

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
	}

} // namespace EndlessCrawler

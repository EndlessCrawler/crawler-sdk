

import {
	CompassBase,
	ModuleBase,
	ModuleInterface,
	ModuleId,
} from './modules'

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
	}

	//-------------------------------
	// Module implementation
	//
	export class Module extends ModuleBase implements ModuleInterface {

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
	}

} // namespace LootUnderworld

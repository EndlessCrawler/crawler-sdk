// import {
// 	Compass
// } from './dojo'


//
// https://www.typescriptlang.org/docs/handbook/namespaces.html
//
namespace Validation {
	export interface StringValidator {
		isAcceptable(s: string): boolean;
	}
	const lettersRegexp = /^[A-Za-z]+$/;
	const numberRegexp = /^[0-9]+$/;
	export class LettersOnlyValidator implements StringValidator {
		isAcceptable(s: string) {
			return lettersRegexp.test(s);
		}
	}
	export class ZipCodeValidator implements StringValidator {
		isAcceptable(s: string) {
			return s.length === 5 && numberRegexp.test(s);
		}
	}
}

const validator = new Validation.LettersOnlyValidator()
const v1 = validator.isAcceptable('dds')

const { isAcceptable } = validator
const v2 = isAcceptable('dds')




//
// https://www.typescriptlang.org/docs/handbook/2/classes.html
//
class Base {
	static getGreeting() {
		return "Hello world";
	}
}
const { getGreeting } = Base
const gr1 = getGreeting()


interface Checkable {
	check(name: string): boolean;
}

// cant define interface method as static
// class NameChecker implements Checkable {
// 	static check = (s: string) => {
// 		return s.toLowerCase() === "ok";
// 	}
// }
// const { check } = NameChecker
// const ch1 = check('dsds')

// from: https://stackoverflow.com/a/40006145/360930
const MyCheckable: Checkable = class {
	static check = (s: string) => {
		return s.toLowerCase() === "ok";
	}
}
const { check } = MyCheckable
const ch2 = check('dsds')





//
// https://www.typescriptlang.org/docs/handbook/namespaces.html#ambient-namespaces
//
declare namespace D3 {
	export interface Selectors {
		select: {
			(selector: string): Selection;
			(element: EventTarget): Selection;
		};
	}
	export interface Event {
		x: number;
		y: number;
	}
	export interface Base extends Selectors {
		event: Event;
	}
}
declare var d3: D3.Base;
export { d3 }





//
// https://stackoverflow.com/a/36384384/360930
//
export class APIObjectA {
	// Here, "Property1Value" refers to the version in APIObjectA
	public get property1(): APIObjectA.Property1Value {
		return "possible_value_A"
	}

	public get property2(): APIObjectA.Property2Value {
		return "possible_value_C"
	}
}
module APIObjectA {
	// Valid values in APIObjectA
	export type Property1Value = "possible_value_A" | "possible_value_B";
	export type Property2Value = "possible_value_C" | "possible_value_D";
}






//------------------------------------------
// Dojo as Namespace
//

type _Compass_ = unknown
interface NamespaceTypes {
	Compass: _Compass_
}
interface NamespaceFunctions {
	validateCompass(compass: _Compass_ | null): boolean;
}

namespace DojoNamespace {
	export interface Compass {
		domainId?: Domain
		tokenId?: number
		over?: number
		under?: number
		north?: number
		east?: number
		west?: number
		south?: number
	}
	export enum Domain {
		Realms = 1,
		// CryptsAndCaverns = 2,
	}
	export const DomainTokenCount = {
		[Domain.Realms]: 8000,
	}
	export const Instance: NamespaceFunctions = class {
		static validateCompass = (compass: Compass | null): boolean => {
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
}
const {
	// Compass,
	validateCompass,
} = DojoNamespace.Instance





//------------------------------------------
// Dojo as Modue
//

// type _Compass_ = unknown
interface ModuleTypes {
	Compass: _Compass_
}
interface ModuleFunctions {
	validateCompass(compass: _Compass_ | null): boolean;
}


module DojoModule {

	export interface Compass {
		domainId?: Domain
		tokenId?: number
		over?: number
		under?: number
		north?: number
		east?: number
		west?: number
		south?: number
	}

	export enum Domain {
		Realms = 1,
		// CryptsAndCaverns = 2,
	}

	export const DomainTokenCount = {
		[Domain.Realms]: 8000,
	}

	const validateCompass = (compass: Compass | null): boolean => {
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
module DojoModule  {
	// Valid values in APIObjectA
	export type Property1Value = "possible_value_A" | "possible_value_B";
	export type Property2Value = "possible_value_C" | "possible_value_D";
}






export {
	DojoNamespace
}


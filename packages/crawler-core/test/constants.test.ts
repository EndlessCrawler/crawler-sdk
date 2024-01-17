import 'jest-expect-message'
import {
	CompassMask,
	Dir,
	CompassDirMax,
	flipDir,
	getOppositeTerrain,
	Terrain
} from '../src'


const _max = 18446744073709551615n

describe('* constants', () => {

	it('CompassDirMax', () => {
		expect(CompassDirMax).toBe(_max)
		expect(CompassDirMax).toBe(BigInt('0xffffffffffffffff'))
		// expect(Number(CompassDirMax >> 1n)).toBe(Number.MAX_SAFE_INTEGER)
	})

	it('CompassMask', () => {
		expect(CompassMask.North).toBe(_max << 192n)
		expect(CompassMask.East).toBe(_max << 128n)
		expect(CompassMask.West).toBe(_max << 64n)
		expect(CompassMask.South).toBe(_max)
	})

	it('Dir', () => {
		expect(flipDir(Dir.North)).toBe(Dir.South)
		expect(flipDir(Dir.South)).toBe(Dir.North)
		expect(flipDir(Dir.East)).toBe(Dir.West)
		expect(flipDir(Dir.West)).toBe(Dir.East)
	})

	it('Terrain', () => {
		expect(getOppositeTerrain(Terrain.Empty)).toBe(Terrain.Empty)
		expect(getOppositeTerrain(Terrain.Earth)).toBe(Terrain.Air)
		expect(getOppositeTerrain(Terrain.Air)).toBe(Terrain.Earth)
		expect(getOppositeTerrain(Terrain.Water)).toBe(Terrain.Fire)
		expect(getOppositeTerrain(Terrain.Fire)).toBe(Terrain.Water)
	})

})

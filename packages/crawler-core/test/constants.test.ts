import 'jest-expect-message'
import {
	Dir,
	flipDir,
	getOppositeTerrain,
	Terrain
} from '../src'

describe('* constants', () => {

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

import {
	Dir,
	Terrain,
	FlippedDir,
	OppositeTerrain,
} from "./constants"


export const flipDir = (dir: Dir): Dir => {
	return FlippedDir[dir]
}

// Opposite terrains cannot connect to each other
// Earth <> Air / Water <> Fire
// equals to Crawl.getOppositeTerrain()
export const getOppositeTerrain = (terrain: Terrain): Terrain => {
	return OppositeTerrain[terrain]
}


//-----------------------------------
// Bitmap
//

export type BitmapXY = {
	x: number
	y: number
}

export const bitmapPosToXY = (pos: number): BitmapXY => {
	return {
		x: (pos % 16),
		y: Math.floor(pos / 16),
	}
}

export const bitmapXYToPos = (xy: BitmapXY): number => {
	return (xy.y * 16 + xy.x)
}

export const flipDoorPositionXY = (xy: BitmapXY): BitmapXY => {
	if (xy.x === 0) return { x: 15, y: xy.y }
	if (xy.x == 15) return { x: 0, y: xy.y }
	if (xy.y === 0) return { x: xy.x, y: 15 }
	if (xy.y == 15) return { x: xy.x, y: 0 }
	console.warn(`flipDoorPositionXY() not a door:`, xy)
	return xy
}

export const flipDoorPosition = (pos: number): number => {
	return bitmapXYToPos(flipDoorPositionXY(bitmapPosToXY(pos)))
}

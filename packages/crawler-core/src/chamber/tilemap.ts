/**
 * The tilemap library — a chamber's internal tile arrangement (the *chamber layout*)
 * and the topology helpers over it.
 *
 * The tilemap is the SDK's **only** map representation: there is no bitmap type and
 * no bitmap operations (the legacy packed-uint256 `bitmap` field was dropped — it
 * cannot represent larger-than-16×16 chambers).
 */
import { type BigIntish, bigIntToNumberArray } from '../bigintish';
import type { TileType } from './constants';

/** The tilemap: one {@link TileType} per tile, row-major (`y * width + x`). */
export type Tilemap = TileType[];

/** Anything that can be converted to a {@link Tilemap} — a tile array, or tile bytes packed in a bigint. */
export type TilemapIsh = Tilemap | BigIntish;

/**
 * A tilemap's size in tiles. Comes from the schema's size policy: fixed per schema
 * (`ec` is 16×16) or carried per chamber (`size: 'per-chamber'` schemas).
 */
export interface TilemapSize {
  width: number;
  height: number;
}

/**
 * The `ec` grid — the default when no schema size is passed.
 *
 * @remarks Schema-aware callers should pass their schema's size; this default exists
 * for the fixed 16×16 `ec` world the helpers grew up with.
 */
export const defaultTilemapSize: TilemapSize = {
  width: 16,
  height: 16,
};

/** An x/y position inside a tilemap. */
export interface Xy {
  x: number;
  y: number;
}

/** A tile position inside a tilemap (`y * width + x`). */
export type Tile = number;

/**
 * @param pos a tile position or an {@link Xy}
 * @returns true if the value is a {@link Tile} (number), false if {@link Xy}
 */
export const isTile = (pos: Xy | Tile): pos is Tile => typeof pos === 'number';

/**
 * @param pos the tile position
 * @param size the tilemap size (the schema's size policy; defaults to the `ec` 16×16 grid)
 * @returns the tile position converted to {@link Xy}
 */
export const tileToXy = (pos: Tile, size: TilemapSize = defaultTilemapSize): Xy => {
  return {
    x: pos % size.width,
    y: Math.floor(pos / size.width),
  };
};

/**
 * @param xy the x/y position
 * @param size the tilemap size (the schema's size policy; defaults to the `ec` 16×16 grid)
 * @returns the {@link Xy} position converted to a tile position
 */
export const xyToTile = (xy: Xy, size: TilemapSize = defaultTilemapSize): Tile => {
  return xy.y * size.width + xy.x;
};

/**
 * Flips a door position across the tilemap: a door on one edge maps to the matching
 * door position on the opposite edge of the neighboring chamber.
 *
 * This is the derivation for a door's `destTile` — the tile the player enters from
 * on arrival in the destination chamber.
 *
 * @param pos the door's position (tile or {@link Xy}), on a tilemap edge
 * @param size the tilemap size (the schema's size policy; defaults to the `ec` 16×16 grid)
 * @returns the flipped position, in the same representation as the input
 */
export const flipDoorPosition = <T extends Xy | Tile>(
  pos: T,
  size: TilemapSize = defaultTilemapSize,
): T => {
  let result: Xy = isTile(pos) ? tileToXy(pos, size) : (pos as Xy);
  if (result.x === 0) result = { x: size.width - 1, y: result.y };
  else if (result.x === size.width - 1) result = { x: 0, y: result.y };
  else if (result.y === 0) result = { x: result.x, y: size.height - 1 };
  else if (result.y === size.height - 1) result = { x: result.x, y: 0 };
  return (isTile(pos) ? xyToTile(result, size) : result) as T;
};

/**
 * @param tmp a tile array, or tile bytes packed inside a bigint
 * @returns the value as a {@link Tilemap}
 */
export const toTilemap = (tmp: TilemapIsh): Tilemap => {
  if (Array.isArray(tmp)) {
    return tmp;
  }
  // bytes packed inside a BigIntish
  return bigIntToNumberArray(tmp);
};

/**
 * @param tmp the tilemap to search
 * @param tilesToFind the {@link TileType}s to look for
 * @returns the tile positions holding any of the wanted tile types
 */
export const findTilesInTilemap = (tmp: Tilemap, tilesToFind: TileType[]): Tile[] => {
  const result: Tile[] = [];
  tmp.forEach((tile, index) => {
    if (tilesToFind.includes(tile)) {
      result.push(index);
    }
  });
  return result;
};

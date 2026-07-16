/**
 * The tilemap library — a chamber's internal tile arrangement (the *chamber layout*)
 * and the topology helpers over it.
 *
 * The tilemap is the SDK's **only** map representation: there is no bitmap type and
 * no bitmap operations (the legacy packed-uint256 `bitmap` field was dropped — it
 * cannot represent larger-than-16×16 chambers).
 */
import { type BigIntish, biToNumberArray } from '../bigintish';
import { TileType } from './constants';

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
 * @param size the tilemap size (the schema's size policy, or the chamber's own)
 * @returns the tile position converted to {@link Xy}
 */
export const tileToXy = (pos: Tile, size: TilemapSize): Xy => {
  return {
    x: pos % size.width,
    y: Math.floor(pos / size.width),
  };
};

/**
 * @param xy the x/y position
 * @param size the tilemap size (the schema's size policy, or the chamber's own)
 * @returns the {@link Xy} position converted to a tile position
 */
export const xyToTile = (xy: Xy, size: TilemapSize): Tile => {
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
 * @param size the tilemap size (the schema's size policy, or the chamber's own)
 * @returns the flipped position, in the same representation as the input
 */
export const flipDoorPosition = <T extends Xy | Tile>(pos: T, size: TilemapSize): T => {
  let result: Xy = isTile(pos) ? tileToXy(pos, size) : (pos as Xy);
  if (result.x === 0) result = { x: size.width - 1, y: result.y };
  else if (result.x === size.width - 1) result = { x: 0, y: result.y };
  else if (result.y === 0) result = { x: result.x, y: size.height - 1 };
  else if (result.y === size.height - 1) result = { x: result.x, y: 0 };
  return (isTile(pos) ? xyToTile(result, size) : result) as T;
};

/**
 * @param tmp a tile array, or tile bytes packed inside a bigint
 * @param size the tilemap size (the schema's size policy, or the chamber's own)
 * @returns the value as a {@link Tilemap}, fitted to the grid: exactly `width × height` tiles
 * @remarks Shorter input is padded with leading `Void` tiles — bigint packing cannot
 * carry leading zero bytes, and the chain's generated `bytes tilemap` starts with
 * them, so padding to the grid restores exactly what packing dropped. Input past
 * the grid is ignored with a `console.warn`.
 */
export const toTilemap = (tmp: TilemapIsh, size: TilemapSize): Tilemap => {
  const tiles = size.width * size.height;
  const raw = Array.isArray(tmp) ? tmp : biToNumberArray(tmp);
  if (raw.length === tiles) {
    return raw;
  }
  if (raw.length > tiles) {
    console.warn(
      `toTilemap(): input carries ${raw.length} tiles — ignoring everything past the ${size.width}x${size.height} grid`,
    );
    return raw.slice(0, tiles);
  }
  // leading Void bytes cannot survive bigint packing — restore them
  return [...new Array<TileType>(tiles - raw.length).fill(TileType.Void), ...raw];
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

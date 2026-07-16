/**
 * `ChamberData<Schema>` and `Door` — the normalized, game-facing chamber record
 * (see `SDK_SPECS.md` §`ChamberData<Schema>` and §`Door`).
 */
import type { Compass } from '../coords/types';
import type { AttributesOf, ChamberSize, DataSchema, TerrainOf } from '../schema/schema';
import type { Dir } from './constants';
import type { Tilemap } from './tilemap';

//
// Endless Crawler Solidity Model
// (Crawl.sol)
//
// struct ChamberData {
// 	uint256 coord;
// 	uint256 tokenId;
// 	uint256 seed;
// 	uint232 yonder;
// 	uint8 chapter;			// Chapter minted
// 	Crawl.Terrain terrain;
// 	Crawl.Dir entryDir;
// 	Crawl.Hoard hoard;
// 	uint8 gemPos;				// gem bitmap position
// 	// dynamic until all doors are unlocked
// 	uint8[4] doors; 		// bitmap position in NEWS order
// 	uint8[4] locks; 		// lock status in NEWS order
// 	// optional
// 	uint256 bitmap;			// bit map, 0 is void/walls, 1 is path
// 	bytes tilemap;			// tile map
// 	// custom data
// 	CustomData[] customData;
// }
// struct Hoard {
// 	Crawl.Gem gemType;
// 	uint16 coins;		// coins value
// 	uint16 worth;		// gem + coins value
// }

/**
 * A connection between chambers. A chamber has many doors; games navigate by
 * `destCoord` — they never need offset math (the self-sufficiency invariant).
 *
 * `destCoord` and `destTile` are computed at build time by the converter, via the
 * schema's coordinate schema and the tilemap's `flipDoorPosition()` respectively.
 */
export interface Door {
  /** the door's tile in this chamber */
  readonly tile: number;
  /** the destination coordinate this door leads to */
  readonly destCoord: bigint;
  /** the tile the player enters from on arrival in the destination chamber */
  readonly destTile: number;
  /** optional, aesthetic — for map-building only */
  readonly direction?: Dir;
  /** `undefined` = unlocked */
  readonly isLocked?: boolean;
  /** marks the chamber's entry door */
  readonly isEntry?: boolean;
}

/**
 * All static data of a chamber, keyed by coord. Two parts: a normalized,
 * game-facing core — structurally identical across schemas — and an `attributes`
 * section typed by the schema. Values are in-memory form (`bigint` for coords,
 * token ids, and `seed`; readable strings for terrain and string-domain attributes).
 *
 * The stored (serialized) form lives in the world JSON — see `WorldJson`.
 */
export interface ChamberData<S extends DataSchema = DataSchema> {
  readonly coord: bigint;
  readonly tokenId: bigint;
  /** every chamber has one; the converter fills it */
  readonly name: string;
  /** stored where the coordinate schema defines one (NEWS does) */
  readonly compass?: Compass;
  /** core property on every chamber — never an attribute; the schema's readable string domain */
  readonly terrain: TerrainOf<S>;
  readonly yonder: number;
  /** not in `tokenURI` — an on-chain supplement fetched by the payload assembler */
  readonly seed: bigint;
  /** the chamber's internal layout */
  readonly tilemap: Tilemap;
  readonly doors: readonly Door[];
  /** present exactly when the schema's size policy is `'per-chamber'` */
  readonly size?: ChamberSize;
  /**
   * the chamber's final state is not fully defined and may change; the `ec`
   * converter derives it from locked doors; absent for all `cnc` chambers.
   * For `ec` the on-chain change is monotone: locks only ever clear (a
   * previously locked door may drop entirely) — a door never gains a lock
   */
  readonly isDynamic?: boolean;
  /** the schema-local gameplay extras, typed by the schema descriptor */
  readonly attributes: AttributesOf<S>;
}

/**
 * @param chamber the chamber to read
 * @param dir the direction to filter by
 * @returns the chamber's doors in that direction (a schema may have several per direction)
 */
export const getDoorsTo = (chamber: ChamberData, dir: Dir): Door[] =>
  chamber.doors.filter((door) => door.direction === dir);

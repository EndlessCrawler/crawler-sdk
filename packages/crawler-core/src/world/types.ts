/**
 * `World`, `WorldInfo`, and the view types (see `SDK_SPECS.md` §Worlds & Views, §Chains).
 *
 * A world exists in two forms:
 * - **`WorldJson`** — the stored form: plain, readable JSON, fully usable without
 *   the SDK (decimal-string keys, readable string values, self-describing `worldInfo`).
 * - **`World`** — the in-memory form produced by `loadWorld`: keys and chain-scale
 *   values normalized to `bigint`, views as maps, immutable by type.
 */
import type { ChamberData, Door } from '../chamber/chamber';
import type { ChamberSize, DataSchema, SchemaViewName } from '../schema/schema';
import type { SchemaName } from '../schema/registry';

//--------------------------------
// Chains — the world's contract binding
//

/** The chain family a world lives on. */
export type Network = 'ethereum' | 'base' | 'starknet';

/**
 * The known contract names — a literal union, never bare `string`. Required on the
 * World binding: `crawler-api`'s artifact registry resolves ABIs by this name.
 */
export type ContractName = 'CrawlerToken';

//--------------------------------
// Views
//

/** All view names: the universal `worldInfo` plus the schema-declared views. */
export type ViewName = 'worldInfo' | SchemaViewName;

/**
 * The world's own info block — stored as a singleton view (one well-known entry,
 * not a keyed map), so a world is uniformly a set of views with one load/serialize
 * path. Universal: every world has one, regardless of schema.
 */
export interface WorldInfo {
  /** the world's name: `'mainnet' | 'goerli' | 'sepolia' | ...` */
  readonly name: string;
  readonly network: Network;
  readonly chainId: bigint;
  /** the ERC-721 token contract this world is bound to */
  readonly contractAddress: bigint;
  /** finds the contract's ABI in `crawler-api`'s artifact registry */
  readonly contractName: ContractName;
  /** the schema this world conforms to, by name */
  readonly schema: SchemaName;
  /** ISO 8601 UTC build (or migration) stamp */
  readonly timestamp: string;
}

/**
 * The views a world carries, in memory. Each view is optional per world
 * (`hasView` is the capability query); keys are always `bigint`.
 */
export interface WorldViews<S extends DataSchema = DataSchema> {
  readonly worldInfo: WorldInfo;
  /** the placement relation: an entry here spawns a chamber into the playable world */
  readonly tokenCoord?: ReadonlyMap<bigint, bigint>;
  /** the data used to build the game world, keyed by coord */
  readonly chamberData?: ReadonlyMap<bigint, ChamberData<S>>;
  /** the token's original on-chain SVG, display-only, keyed by token id */
  readonly tokenSvg?: ReadonlyMap<bigint, string>;
}

//--------------------------------
// World — in-memory form
//

/**
 * A dataset: a plain, deeply-typed value conforming to a named schema and bound to
 * an ERC-721 token contract. Immutable — the read surface has no `.set()`; live
 * chambers fold in via pure merge (a *new* `World` value, swapped inside the `Crawler`).
 *
 * The world-level fields mirror the `worldInfo` view (stored once, exposed directly).
 */
export interface World<S extends DataSchema = DataSchema> {
  readonly name: string;
  readonly network: Network;
  readonly chainId: bigint;
  readonly contractAddress: bigint;
  readonly contractName: ContractName;
  readonly schema: SchemaName;
  readonly views: WorldViews<S>;
}

//--------------------------------
// WorldJson — stored form
//

/** A stored bigint: a number when it fits safely, a decimal string otherwise. */
export type BigIntJson = number | string;

/** The stored `worldInfo` view. `contractAddress` keeps its readable hex form. */
export interface WorldInfoJson {
  readonly name: string;
  readonly network: Network;
  readonly chainId: BigIntJson;
  readonly contractAddress: string;
  readonly contractName: ContractName;
  readonly schema: SchemaName;
  readonly timestamp: string;
}

/** A stored compass: named directions, readable numbers (decimal strings past 2^53). */
export type CompassJson = { readonly [direction: string]: BigIntJson };

/** A stored door. `direction` is the readable name (`'North'`, ...). */
export interface DoorJson {
  readonly tile: number;
  readonly destCoord: BigIntJson;
  readonly destTile: number;
  readonly direction?: string;
  readonly isLocked?: boolean;
  readonly isEntry?: boolean;
}

/** A stored chamber record — readable string values, no bitmap, no stored slug. */
export interface ChamberDataJson {
  readonly coord: BigIntJson;
  readonly tokenId: BigIntJson;
  readonly name: string;
  readonly compass?: CompassJson;
  readonly terrain: string;
  readonly yonder: number;
  /** canonical hex form */
  readonly seed: string;
  readonly tilemap: readonly number[];
  readonly doors: readonly DoorJson[];
  readonly size?: ChamberSize;
  readonly isDynamic?: boolean;
  readonly attributes: { readonly [attribute: string]: string | number | boolean };
}

/**
 * The stored world: a set of views keyed by view name (splittable per view later
 * without reshaping any data). Keyed-map views use decimal-string keys; hex is
 * always valid input.
 */
export interface WorldJson {
  readonly worldInfo: WorldInfoJson;
  readonly tokenCoord?: { readonly [tokenId: string]: BigIntJson };
  readonly chamberData?: { readonly [coord: string]: ChamberDataJson };
  readonly tokenSvg?: { readonly [tokenId: string]: string };
}

/** re-export for World-consumer convenience — the door type is chamber vocabulary */
export type { Door };

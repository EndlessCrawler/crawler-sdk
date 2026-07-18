/**
 * The `Crawler` client — the ergonomic wrapper over the functional core
 * (see `SDK_SPECS.md` §The `Crawler` client). Two concepts:
 *
 * - **{@link Crawler}** — the multi-world container: owns the registered world set,
 *   lookup by name, the converter registry, and the coarse "world updated" signal.
 * - **{@link WorldHandle}** — the per-world, schema-bound accessor: method-style
 *   reads delegating to the functional core, plus `import()` (the live-merge entry
 *   point) and `coords` (the schema's coordinate library).
 *
 * The wrapper is thin: every method delegates to the functional core; it never
 * contains behavior the functions don't already expose. There is **no mutable
 * "current world"** — if a UI needs one, it's UI state.
 */
import { type BigIntish, bi } from '../bigintish';
import { type ChamberData, type Door, getDoorsTo } from '../chamber/chamber';
import type { Dir } from '../chamber/constants';
import { type CoordinateSchemaLibraries, getCoordinateSchema } from '../coords/registry';
import type { Compass } from '../coords/types';
import {
  AmbiguousWorldError,
  DuplicateWorldError,
  MissingConverterError,
  UnknownWorldError,
} from '../errors';
import { getSchema, type SchemaName } from '../schema/registry';
import type { DataSchema } from '../schema/schema';
import type { ConvertedToken, Converter } from '../world/converter';
import { loadWorld } from '../world/load';
import { type ChamberLocator, resolveCoord } from '../world/locator';
import { mergeConvertedToken } from '../world/merge';
import {
  getChamber,
  getChamberByTokenId,
  getChamberCount,
  getChambers,
  getDynamicChamberCoords,
  getDynamicChamberCount,
  getDynamicChamberTokenIds,
  getStaticChamberCount,
  getTokenCoord,
  getTokenCount,
  getTokenIds,
  getTokenSvg,
  hasView,
} from '../world/reads';
import type { ViewName, World, WorldInfo, WorldJson } from '../world/types';

/** The coordinate-schema library a schema's worlds navigate by. */
export type CoordinateLibraryOf<S extends DataSchema> =
  CoordinateSchemaLibraries[S['coordinateSchema']];

/**
 * What a `crawler-data` per-world subpath export carries: the world data plus its
 * schema's converter (so `world.import` has its converter with zero wiring).
 */
export interface WorldBundle {
  readonly world: WorldJson;
  readonly converter?: Converter;
}

/** Accepted by {@link createCrawler}: a bare stored world, or a {@link WorldBundle}. */
export type WorldSource = WorldJson | WorldBundle;

/** The coarse "world updated" event — fired when a world value is swapped by a merge. */
export interface WorldUpdatedEvent {
  /** the updated world's name */
  readonly world: string;
}

/** A subscriber to the {@link Crawler}'s coarse world-updated signal. */
export type WorldUpdatedListener = (event: WorldUpdatedEvent) => void;

const _isBundle = (source: WorldSource): source is WorldBundle =>
  'world' in source && !('worldInfo' in source);

/**
 * A chamber, bound to its world: the stored record plus a runtime back-pointer
 * (`chamber.world`) and the navigation methods. The *stored* record stays plain
 * serializable data — reach it via {@link Chamber.data}.
 */
export class Chamber<S extends DataSchema = DataSchema> {
  /** the world handle this chamber belongs to (runtime back-pointer, never serialized) */
  readonly world: WorldHandle<S>;
  /** the plain stored record */
  readonly data: ChamberData<S>;

  constructor(world: WorldHandle<S>, data: ChamberData<S>) {
    this.world = world;
    this.data = data;
  }

  get coord(): bigint {
    return this.data.coord;
  }
  get tokenId(): bigint {
    return this.data.tokenId;
  }
  get name(): string {
    return this.data.name;
  }
  get terrain(): ChamberData<S>['terrain'] {
    return this.data.terrain;
  }
  get yonder(): number {
    return this.data.yonder;
  }
  get seed(): bigint {
    return this.data.seed;
  }
  get tilemap(): ChamberData<S>['tilemap'] {
    return this.data.tilemap;
  }
  get doors(): readonly Door[] {
    return this.data.doors;
  }
  get size(): ChamberData<S>['size'] {
    return this.data.size;
  }
  get isDynamic(): boolean {
    return this.data.isDynamic === true;
  }
  get attributes(): ChamberData<S>['attributes'] {
    return this.data.attributes;
  }

  /**
   * @returns the chamber's readable slug — never stored, computed via the world's
   *   coordinate schema — or `null` where the schema defines none
   */
  slug(): string | null {
    return this.world.coords.coordToSlug(this.data.coord);
  }

  /**
   * @returns the chamber's compass — the stored one where the coordinate schema
   *   defines it — or `undefined` for compass-less coordinate schemas
   */
  compass(): Compass | undefined {
    return this.data.compass ?? this.world.coords.coordToCompass(this.data.coord) ?? undefined;
  }

  /**
   * @param dir the direction to filter by
   * @returns the chamber's doors in that direction (a schema may have several)
   */
  getDoorsTo(dir: Dir): Door[] {
    return getDoorsTo(this.data, dir);
  }
}

/**
 * The per-world, schema-bound accessor. Method-style reads delegate to the pure
 * functional core; all static reads are sync. The handle is stable across merges —
 * it always reads the world's *current* immutable value.
 */
export class WorldHandle<S extends DataSchema = DataSchema> {
  /** the world's registered name */
  readonly name: string;
  readonly #getWorld: () => World<S>;
  // schema-erased on purpose: a contravariant `World<S>` here would make
  // `WorldHandle<typeof ec>` unassignable to `WorldHandle` (and every Chamber
  // with it) — the runtime handle is schema-erased anyway
  readonly #swapWorld: (next: World) => void;
  readonly #converterFor: (schema: SchemaName) => Converter | undefined;

  constructor(
    name: string,
    getWorld: () => World<S>,
    swapWorld: (next: World) => void,
    converterFor: (schema: SchemaName) => Converter | undefined,
  ) {
    this.name = name;
    this.#getWorld = getWorld;
    this.#swapWorld = swapWorld;
    this.#converterFor = converterFor;
  }

  /** the world's current immutable value (a new value after every merge) */
  get data(): World<S> {
    return this.#getWorld();
  }

  /** the world's info block */
  get info(): WorldInfo {
    return this.data.views.worldInfo;
  }

  /** the world's schema descriptor */
  get schema(): DataSchema {
    return getSchema(this.data.schema);
  }

  /**
   * The schema's coordinate-schema library — the full navigation/conversion
   * function set (NEWS for `ec` worlds). Schema-bound math lives here, not on
   * the standard client surface.
   */
  get coords(): CoordinateLibraryOf<S> {
    return getCoordinateSchema(this.schema.coordinateSchema) as CoordinateLibraryOf<S>;
  }

  /**
   * @param viewName the view to test for
   * @returns true if this world carries the view
   */
  hasView(viewName: ViewName): boolean {
    return hasView(this.data, viewName);
  }

  /**
   * @param coord the chamber's coordinate, in any {@link BigIntish} form
   * @returns the {@link Chamber} at that coord, or `undefined`
   */
  getChamber(coord: BigIntish): Chamber<S> | undefined {
    const chamber = getChamber(this.data, coord);
    return chamber ? new Chamber(this, chamber) : undefined;
  }

  /**
   * @param tokenId the chamber's token id
   * @returns the {@link Chamber} placed by that token, or `undefined`
   */
  getChamberByTokenId(tokenId: BigIntish): Chamber<S> | undefined {
    const chamber = getChamberByTokenId(this.data, tokenId);
    return chamber ? new Chamber(this, chamber) : undefined;
  }

  /**
   * @param slug the chamber's readable slug
   * @returns the {@link Chamber} at the slug's coord, or `undefined`
   */
  getChamberBySlug(slug: string): Chamber<S> | undefined {
    const coord = this.coords.slugToCoord(slug);
    return coord !== 0n ? this.getChamber(coord) : undefined;
  }

  /**
   * Resolves a {@link ChamberLocator} — a chamber key in any form — to the
   * `ChamberData` key (the coord); first field present wins: `tokenId`, `coord`,
   * `slug`, `compass`. Delegates to the pure `resolveCoord(world, locator)`.
   *
   * @param locator the chamber key, in any form
   * @returns the coord, or `undefined` when the locator resolves to nothing
   */
  resolveCoord(locator: ChamberLocator): bigint | undefined {
    return resolveCoord(this.data, locator);
  }

  /** @returns all chambers, bound to this handle */
  getChambers(): Chamber<S>[] {
    return getChambers(this.data).map((chamber) => new Chamber(this, chamber));
  }

  /**
   * @param tokenId the token to place
   * @returns the token's coord, or `undefined` if not in this world
   */
  getTokenCoord(tokenId: BigIntish): bigint | undefined {
    return getTokenCoord(this.data, tokenId);
  }

  /** @returns all placed token ids */
  getTokenIds(): bigint[] {
    return getTokenIds(this.data);
  }

  /** @returns the number of placed tokens */
  getTokenCount(): number {
    return getTokenCount(this.data);
  }

  /**
   * @param tokenId the token to look up
   * @returns the token's original on-chain SVG (display-only), or `undefined`
   */
  getTokenSvg(tokenId: BigIntish): string | undefined {
    return getTokenSvg(this.data, tokenId);
  }

  /** @returns the total chamber count */
  getChamberCount(): number {
    return getChamberCount(this.data);
  }

  /** @returns the number of static (fully-defined) chambers */
  getStaticChamberCount(): number {
    return getStaticChamberCount(this.data);
  }

  /** @returns the number of dynamic chambers */
  getDynamicChamberCount(): number {
    return getDynamicChamberCount(this.data);
  }

  /** @returns the coords of all dynamic chambers */
  getDynamicChamberCoords(): bigint[] {
    return getDynamicChamberCoords(this.data);
  }

  /** @returns the token ids of all dynamic chambers */
  getDynamicChamberTokenIds(): bigint[] {
    return getDynamicChamberTokenIds(this.data);
  }

  /**
   * The live-merge entry point: converts the schema's token payload and folds the
   * result into this world via pure merge — a **new** world value is swapped into
   * the `Crawler` and the coarse world-updated signal fires.
   *
   * @param tokenId the minted token
   * @param payload the schema's token payload (cached tokenURI data + optional
   *   on-chain supplement, assembled by the caller)
   * @returns the imported {@link Chamber}
   * @throws {@link MissingConverterError} if no converter is registered for this
   *   world's schema (converters ride the `crawler-data` per-world exports)
   */
  import(tokenId: BigIntish, payload: unknown): Chamber<S> {
    const world = this.data;
    const converter = this.#converterFor(world.schema);
    if (!converter) {
      throw new MissingConverterError(world.schema);
    }
    const id = bi.toBigInt(tokenId);
    const converted = converter.convert(id, payload) as ConvertedToken<S>;
    this.#swapWorld(mergeConvertedToken(world, id, converted));
    return new Chamber(this, converted.chamberData);
  }

  /**
   * Folds an **already-converted** token into this world through the same pure
   * merge as {@link WorldHandle.import} — no converter runs. This is how
   * persisted live chambers are restored (conversion is deterministic, so the
   * stored converter *output* re-enters the world as-is — SPECS §Data pipeline
   * item 5); `import()` remains the entry point for fresh payloads.
   *
   * @param tokenId the token being restored
   * @param converted the converter's stored output for the token
   * @returns the restored {@link Chamber}
   */
  importConverted(tokenId: BigIntish, converted: ConvertedToken<S>): Chamber<S> {
    const id = bi.toBigInt(tokenId);
    this.#swapWorld(mergeConvertedToken(this.data, id, converted));
    return new Chamber(this, converted.chamberData);
  }
}

/**
 * The multi-world container. Created sync from imported worlds; owns the registered
 * world set, lookup by name, and the converter registry. Cross-world traversal
 * resolves through world-qualified destinations — you never "switch" worlds.
 */
export class Crawler {
  readonly #worlds = new Map<string, World>();
  readonly #handles = new Map<string, WorldHandle>();
  readonly #converters = new Map<SchemaName, Converter>();
  readonly #listeners = new Set<WorldUpdatedListener>();

  constructor(sources: readonly WorldSource[]) {
    for (const source of sources) {
      const json = _isBundle(source) ? source.world : source;
      const world = loadWorld(json);
      if (this.#worlds.has(world.name)) {
        throw new DuplicateWorldError(world.name);
      }
      this.#worlds.set(world.name, world);
      if (_isBundle(source) && source.converter) {
        this.#converters.set(source.converter.schema, source.converter);
      }
    }
  }

  /** @returns the registered world names */
  worlds(): string[] {
    return [...this.#worlds.keys()];
  }

  /**
   * @param name the world's registered name (`'mainnet'`, ...); **omitted** →
   *   the sole registered world (the single-world case — a deterministic
   *   derivation, not a mutable selection)
   * @returns the world's stable {@link WorldHandle}
   * @throws {@link UnknownWorldError} if no world with that name is registered
   * @throws {@link AmbiguousWorldError} if the name is omitted and there is no
   *   sole registered world (ambiguity is never guessed)
   */
  world<S extends DataSchema = DataSchema>(name?: string): WorldHandle<S> {
    const resolved = name ?? this.#soleWorldName();
    let handle = this.#handles.get(resolved);
    if (!handle) {
      if (!this.#worlds.has(resolved)) {
        throw new UnknownWorldError(resolved, this.worlds());
      }
      handle = new WorldHandle(
        resolved,
        () => {
          const world = this.#worlds.get(resolved);
          if (!world) throw new UnknownWorldError(resolved, this.worlds());
          return world;
        },
        (next) => {
          this.#worlds.set(resolved, next);
          this.#emit({ world: resolved });
        },
        (schema) => this.#converters.get(schema),
      );
      this.#handles.set(resolved, handle);
    }
    // the runtime handle is schema-erased; S is the caller's typed view of it
    return handle as unknown as WorldHandle<S>;
  }

  /**
   * Subscribes to the coarse, environment-agnostic "world updated" signal — the
   * only reactivity primitive; fired when a merge swaps a world value.
   *
   * @param listener called with the updated world's name
   * @returns an unsubscribe function
   */
  subscribe(listener: WorldUpdatedListener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /** the sole registered world's name — the omitted-name derivation */
  #soleWorldName(): string {
    const names = this.worlds();
    if (names.length !== 1) {
      throw new AmbiguousWorldError(names);
    }
    return names[0];
  }

  #emit(event: WorldUpdatedEvent): void {
    for (const listener of this.#listeners) {
      listener(event);
    }
  }
}

/**
 * Creates the {@link Crawler} container from imported worlds — sync, the data is
 * already in hand.
 *
 * @param sources the worlds to register: `crawler-data` per-world exports
 *   (world data + converter) or bare {@link WorldJson} values
 * @returns the {@link Crawler}
 * @throws {@link DuplicateWorldError} if two worlds share a name
 * @throws `WorldValidationError` if a world JSON does not conform to its schema
 * @example
 * ```ts
 * const crawler = createCrawler([mainnetData, goerliData]);
 * const mainnet = crawler.world('mainnet');
 * const chamber = mainnet.getChamber(someCoord);
 * ```
 */
export const createCrawler = (sources: readonly WorldSource[]): Crawler => new Crawler(sources);

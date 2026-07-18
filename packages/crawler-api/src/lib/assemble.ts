/**
 * Per-schema token-payload assemblers — the SDK's **single fetch/assembly
 * implementation** (SPECS §`crawler-api`, §Data pipeline item 4). Assembly is
 * fetching + shaping, **not converting**: the assembled payload feeds the
 * schema's converter (`world.import`) on the live path, and the cache archives
 * it — no second assembly exists anywhere.
 *
 * Returns are typed **structurally** — the api never imports `crawler-data`;
 * compatibility with its `EcTokenPayload` is pinned by a devDependency-typed test.
 */
import { type BigIntish, biToBigInt, type HexString, type World } from '@avante/crawler-core';
import { getWorldContract } from './contracts';
import { InvalidTokenMetadataError, MissingAssemblerError } from './errors';
import { type ReadOptions, readTokenMetadata } from './reads';

/** one OpenSea-style trait of the tokenURI metadata — values are readable strings */
export interface AssembledEcAttribute {
  readonly trait_type: string;
  readonly value: string;
}

/**
 * The on-chain `Crawl.ChamberData` struct, as decoded by viem from the typed
 * world contract (`tokenIdToCoord` → `coordToChamberData`, tilemap generated).
 */
export interface AssembledEcChamber {
  readonly coord: bigint;
  readonly tokenId: bigint;
  readonly seed: bigint;
  readonly yonder: bigint;
  readonly chapter: number;
  readonly terrain: number;
  readonly entryDir: number;
  readonly hoard: {
    readonly gemType: number;
    readonly coins: number;
    readonly worth: number;
  };
  readonly gemPos: number;
  /** door tile positions in NEWS order — `0` = no door on that edge */
  readonly doors: readonly number[];
  /** lock status in NEWS order (`0`/`1`) — parallel to `doors` */
  readonly locks: readonly number[];
  readonly bitmap: bigint;
  /** the generated tile bytes (one tile per byte, row-major) */
  readonly tilemap: HexString;
  readonly customData: readonly { readonly dataType: number; readonly data: HexString }[];
}

/**
 * The assembled tokenURI metadata (blob fields extracted) with the on-chain
 * struct embedded as `chamber` — the same shape the cache archives per token.
 */
export interface AssembledEcMetadata {
  readonly name: string;
  readonly description?: string;
  readonly external_url?: string;
  readonly background_color?: string;
  /** the readable traits: Chapter, Terrain, Coordinate, Yonder, Gem, Coins, Worth + compass directions */
  readonly attributes: readonly AssembledEcAttribute[];
  /** the on-chain struct (named `chamber`, not `chamberData` — the view of that name has a converted shape) */
  readonly chamber: AssembledEcChamber;
}

/**
 * The `ec` schema's assembled token payload — structurally compatible with
 * `crawler-data`'s `EcTokenPayload`, ready for `world.import`.
 */
export interface AssembledEcTokenPayload {
  readonly tokenId: bigint;
  readonly metadata: AssembledEcMetadata;
  /** the decoded original SVG (display-only — the `tokenSvg` view) */
  readonly svg: string;
  /**
   * the decoded `animation_url` player — **not** part of the converter payload;
   * rides along for archival callers (the cache's `<tokenId>.html`)
   */
  readonly html?: string;
}

/** the assembled payload union over the built-in schemas (`cnc` joins with its assembler) */
export type AssembledTokenPayload = AssembledEcTokenPayload;

/** viem per-call read options — `{ blockNumber }` when pinned, else `{}` */
const _callOptions = (options: ReadOptions): { blockNumber?: bigint } =>
  options.blockNumber === undefined ? {} : { blockNumber: biToBigInt(options.blockNumber) };

/** validate the unpacked tokenURI metadata into the `ec` readable shape */
const _ecMetadata = (
  tokenId: bigint,
  metadata: Record<string, unknown>,
): Omit<AssembledEcMetadata, 'chamber'> => {
  if (typeof metadata.name !== 'string') {
    throw new InvalidTokenMetadataError(tokenId, 'metadata has no [name] string');
  }
  if (!Array.isArray(metadata.attributes)) {
    throw new InvalidTokenMetadataError(tokenId, 'metadata has no [attributes] array');
  }
  for (const entry of metadata.attributes as unknown[]) {
    const attribute = entry as Record<string, unknown> | null;
    if (
      attribute === null ||
      typeof attribute !== 'object' ||
      typeof attribute.trait_type !== 'string' ||
      typeof attribute.value !== 'string'
    ) {
      throw new InvalidTokenMetadataError(tokenId, 'metadata [attributes] entry is malformed');
    }
  }
  return metadata as unknown as Omit<AssembledEcMetadata, 'chamber'>;
};

/**
 * the `Chapter` attribute of the `ec` metadata — `coordToChamberData` needs the
 * chapter number, and the tokenURI just fetched already carries it
 */
const _ecChapter = (tokenId: bigint, metadata: Omit<AssembledEcMetadata, 'chamber'>): number => {
  for (const attribute of metadata.attributes) {
    if (attribute.trait_type === 'Chapter') {
      const chapter = Number(attribute.value);
      if (Number.isInteger(chapter) && chapter >= 1 && chapter <= 255) return chapter;
    }
  }
  throw new InvalidTokenMetadataError(tokenId, 'metadata has no usable [Chapter] attribute');
};

/**
 * Assembles one `ec` token's payload: `readTokenMetadata` (tokenURI unpacked)
 * + the `ec` struct reads (`tokenIdToCoord` → `coordToChamberData`, tilemap
 * generated) over the typed world contract — because the SVG alone does not
 * carry the full map data. The caller converts (`world.import`); assembly never
 * does.
 *
 * @param world the `ec` world whose contract binding to read
 * @param tokenId the token to assemble
 * @param options the client binding (`client`/`rpcUrl`) + optional `blockNumber` pin
 * @returns the schema's token payload (+ the archival `html` when the chain carries one)
 * @throws InvalidTokenMetadataError when the tokenURI payload cannot be shaped
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 */
export const assembleEcTokenPayload = async (
  world: World,
  tokenId: BigIntish,
  options: ReadOptions = {},
): Promise<AssembledEcTokenPayload> => {
  const id = biToBigInt(tokenId);
  const { metadata: raw, svg, html } = await readTokenMetadata(world, id, options);
  const metadata = _ecMetadata(id, raw);
  const contract = getWorldContract(world, options);
  const coord = await contract.read.tokenIdToCoord([id], _callOptions(options));
  const chamber = await contract.read.coordToChamberData(
    [_ecChapter(id, metadata), coord, true],
    _callOptions(options),
  );
  return {
    tokenId: id,
    metadata: { ...metadata, chamber },
    svg,
    ...(html === undefined ? {} : { html }),
  };
};

/**
 * The schema-dispatched front door for generic callers (the react live path,
 * the cache fetch): resolves the per-schema assembler from `world.schema`.
 *
 * @param world the world whose contract binding to read
 * @param tokenId the token to assemble
 * @param options the client binding (`client`/`rpcUrl`) + optional `blockNumber` pin
 * @returns the schema's assembled token payload, ready for `world.import`
 * @throws MissingAssemblerError for a schema with no assembler (`cnc`, until its
 * contract lands)
 */
export const assembleTokenPayload = async (
  world: World,
  tokenId: BigIntish,
  options: ReadOptions = {},
): Promise<AssembledTokenPayload> => {
  if (world.schema === 'ec') {
    return assembleEcTokenPayload(world, tokenId, options);
  }
  throw new MissingAssemblerError(world.schema);
};

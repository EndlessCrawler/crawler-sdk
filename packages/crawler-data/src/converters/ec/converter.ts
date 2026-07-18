/**
 * The `ec` converter — `EcTokenPayload` → `ChamberData<ec>` (SPECS §Data pipeline
 * item 2). Pure, synchronous, dependency-free (core only): bundleable with the
 * per-world exports for `world.import`.
 *
 * The map facts come from the embedded on-chain `chamber` struct (`tilemap`,
 * `doors`/`locks`, `seed`, `gemPos`); the readable facts from the metadata traits
 * (terrain, gem, coins, worth, yonder, chapter, name), normalized to the schema
 * domains. The SVG is display-only and passes through untouched. The derivations
 * mirror the P2 world migration exactly — the equivalence suite pins that.
 */
import {
  type ChamberData,
  compassToCoord,
  type ConvertedToken,
  type Converter,
  Dir,
  type Door,
  ec,
  type EcGemType,
  type EcTerrain,
  flipDoorPosition,
  type NewsCompass,
  offsetCoord,
  biToBigInt,
  toTilemap,
} from '@avante/crawler-core';
import { TokenConversionError } from '../errors';
import type { EcTokenMetadata, EcTokenPayload } from './payload';

/** struct array order — doors/locks are NEWS-ordered, indexed by `Dir` */
const _newsDirs = [Dir.North, Dir.East, Dir.West, Dir.South] as const;

/** compass trait name → `NewsCompass` field */
const _compassTraits = [
  ['North', 'north'],
  ['East', 'east'],
  ['West', 'west'],
  ['South', 'south'],
] as const;

const _fail = (tokenId: bigint, message: string): never => {
  throw new TokenConversionError('ec', tokenId, message);
};

const _trait = (metadata: EcTokenMetadata, name: string): string | undefined =>
  metadata.attributes.find((attribute) => attribute.trait_type === name)?.value;

const _requireTrait = (tokenId: bigint, metadata: EcTokenMetadata, name: string): string => {
  const value = _trait(metadata, name);
  return value === undefined ? _fail(tokenId, `metadata has no [${name}] trait`) : value;
};

const _numberTrait = (tokenId: bigint, metadata: EcTokenMetadata, name: string): number => {
  const value = Number(_requireTrait(tokenId, metadata, name));
  return Number.isInteger(value) ? value : _fail(tokenId, `trait [${name}] is not an integer`);
};

const _convert = (tokenId: bigint, payload: EcTokenPayload): ConvertedToken<typeof ec> => {
  const { metadata, svg } = payload;
  const { chamber } = metadata;
  if (biToBigInt(payload.tokenId) !== tokenId) {
    _fail(tokenId, `payload tokenId [${String(payload.tokenId)}] disagrees`);
  }
  if (biToBigInt(chamber.tokenId) !== tokenId) {
    _fail(tokenId, `struct tokenId [${String(chamber.tokenId)}] disagrees`);
  }

  // coord: packed from the compass traits, cross-checked against the struct
  const compass: NewsCompass = {};
  for (const [traitName, key] of _compassTraits) {
    const value = _trait(metadata, traitName);
    if (value !== undefined) compass[key] = biToBigInt(value);
  }
  const coord = compassToCoord(compass);
  if (coord === 0n) {
    _fail(tokenId, 'the compass traits do not form a valid NEWS compass');
  }
  if (coord !== biToBigInt(chamber.coord)) {
    _fail(tokenId, `compass coord [${coord}] disagrees with struct coord [${chamber.coord}]`);
  }

  // readable domains from the traits, normalized to the schema
  const terrain = _requireTrait(tokenId, metadata, 'Terrain').toLowerCase();
  if (!(ec.terrains as readonly string[]).includes(terrain)) {
    _fail(tokenId, `terrain [${terrain}] is not in the [ec] domain`);
  }
  const gemType = _requireTrait(tokenId, metadata, 'Gem').toLowerCase();
  if (!(ec.attributes.gemType as readonly string[]).includes(gemType)) {
    _fail(tokenId, `gem [${gemType}] is not in the [ec] domain`);
  }

  // the map, from the embedded struct — fitted to the schema's grid
  const tilemap = toTilemap(chamber.tilemap, ec.size);
  if (chamber.doors.length !== 4 || chamber.locks.length !== 4) {
    _fail(tokenId, 'struct doors/locks are not NEWS quadruples');
  }
  const doors: Door[] = [];
  for (const dir of _newsDirs) {
    const tile = chamber.doors[dir];
    if (!tile) continue; // 0 = no door on that edge (never locked in the data)
    doors.push({
      tile,
      destCoord: offsetCoord(coord, dir),
      destTile: flipDoorPosition(tile, ec.size),
      direction: dir,
      ...(chamber.locks[dir] ? { isLocked: true } : {}),
      ...(chamber.entryDir === dir ? { isEntry: true } : {}),
    });
  }
  if (!doors.some((door) => door.isEntry)) {
    _fail(tokenId, `entryDir [${chamber.entryDir}] points at no door`);
  }

  const chamberData: ChamberData<typeof ec> = {
    coord,
    tokenId,
    name: metadata.name,
    compass,
    terrain: terrain as EcTerrain,
    yonder: _numberTrait(tokenId, metadata, 'Yonder'),
    seed: biToBigInt(chamber.seed),
    tilemap,
    doors,
    ...(chamber.locks.some((lock) => Boolean(lock)) ? { isDynamic: true } : {}),
    attributes: {
      chapter: _numberTrait(tokenId, metadata, 'Chapter'),
      gemType: gemType as EcGemType,
      gemPos: chamber.gemPos,
      coins: _numberTrait(tokenId, metadata, 'Coins'),
      worth: _numberTrait(tokenId, metadata, 'Worth'),
    },
  };
  return { chamberData, svg };
};

/**
 * The `ec` schema's converter. Rides the per-world exports so `world.import`
 * always has it with zero wiring; also exported from the package root beside
 * its payload types.
 *
 * @throws {@link TokenConversionError} when the payload is malformed or
 * self-inconsistent (compass/struct coord disagreement, out-of-domain trait
 * values, tokenId mismatches)
 */
export const ecConverter: Converter<typeof ec, EcTokenPayload> = {
  schema: 'ec',
  convert: _convert,
};

/**
 * The pure per-view read functions — the functional core the `Crawler` wrapper
 * delegates to (see `SDK_SPECS.md` §Worlds & Views).
 *
 * Miss semantics: reading against a view the world doesn't carry throws
 * {@link MissingViewError} (`hasView` is the capability query); a missing *record*
 * in a present view returns `undefined`.
 */
import { type BigIntish, toBigInt } from '../bigintish';
import type { ChamberData } from '../chamber/chamber';
import type { DataSchema } from '../schema/schema';
import { MissingViewError } from '../errors';
import type { ViewName, World, WorldInfo } from './types';

/**
 * @param world the world to query
 * @param viewName the view to test for
 * @returns true if the world carries the view — the capability query for the
 *   throwing reads below
 */
export const hasView = (world: World, viewName: ViewName): boolean => world.views[viewName] != null;

/**
 * @param world the world to read
 * @returns the world's info block (universal — every world carries one)
 */
export const getWorldInfo = (world: World): WorldInfo => world.views.worldInfo;

const _tokenCoordView = (world: World): ReadonlyMap<bigint, bigint> => {
  const view = world.views.tokenCoord;
  if (!view) throw new MissingViewError(world.name, 'tokenCoord');
  return view;
};

const _chamberDataView = <S extends DataSchema>(
  world: World<S>,
): ReadonlyMap<bigint, ChamberData<S>> => {
  const view = world.views.chamberData;
  if (!view) throw new MissingViewError(world.name, 'chamberData');
  return view;
};

const _tokenSvgView = (world: World): ReadonlyMap<bigint, string> => {
  const view = world.views.tokenSvg;
  if (!view) throw new MissingViewError(world.name, 'tokenSvg');
  return view;
};

//--------------------------------
// TokenCoord — the placement relation
//

/**
 * @param world the world to read
 * @param tokenId the token to place
 * @returns the token's coord, or `undefined` if the token is not in the world
 * @throws {@link MissingViewError} if the world carries no `tokenCoord` view
 */
export const getTokenCoord = (world: World, tokenId: BigIntish): bigint | undefined =>
  _tokenCoordView(world).get(toBigInt(tokenId));

/**
 * @param world the world to read
 * @returns all placed token ids
 * @throws {@link MissingViewError} if the world carries no `tokenCoord` view
 */
export const getTokenIds = (world: World): bigint[] => [..._tokenCoordView(world).keys()];

/**
 * @param world the world to read
 * @returns the number of placed tokens
 * @throws {@link MissingViewError} if the world carries no `tokenCoord` view
 */
export const getTokenCount = (world: World): number => _tokenCoordView(world).size;

//--------------------------------
// ChamberData
//

/**
 * @param world the world to read
 * @param coord the chamber's coordinate, in any {@link BigIntish} form
 * @returns the chamber record, or `undefined` if no chamber has that coord
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getChamber = <S extends DataSchema>(
  world: World<S>,
  coord: BigIntish,
): ChamberData<S> | undefined => _chamberDataView(world).get(toBigInt(coord));

/**
 * @param world the world to read
 * @param tokenId the chamber's token id
 * @returns the chamber record placed by that token, or `undefined`
 * @throws {@link MissingViewError} if the world carries no `tokenCoord` or `chamberData` view
 */
export const getChamberByTokenId = <S extends DataSchema>(
  world: World<S>,
  tokenId: BigIntish,
): ChamberData<S> | undefined => {
  const coord = getTokenCoord(world, tokenId);
  return coord !== undefined ? getChamber(world, coord) : undefined;
};

/**
 * @param world the world to read
 * @returns all chamber records
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getChambers = <S extends DataSchema>(world: World<S>): ChamberData<S>[] => [
  ..._chamberDataView(world).values(),
];

/**
 * @param world the world to read
 * @param coords the chamber coordinates to look up
 * @returns the chamber records found (missing coords are skipped)
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getChambersByCoords = <S extends DataSchema>(
  world: World<S>,
  coords: readonly BigIntish[],
): ChamberData<S>[] => {
  const view = _chamberDataView(world);
  const result: ChamberData<S>[] = [];
  for (const coord of coords) {
    const chamber = view.get(toBigInt(coord));
    if (chamber) result.push(chamber);
  }
  return result;
};

/**
 * @param world the world to read
 * @returns the total chamber count
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getChamberCount = (world: World): number => _chamberDataView(world).size;

/**
 * @param world the world to read
 * @returns the number of static (fully-defined) chambers
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getStaticChamberCount = (world: World): number => {
  let count = 0;
  for (const chamber of _chamberDataView(world).values()) {
    if (!chamber.isDynamic) count++;
  }
  return count;
};

/**
 * @param world the world to read
 * @returns the number of dynamic chambers (final state may still change on-chain)
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getDynamicChamberCount = (world: World): number => {
  let count = 0;
  for (const chamber of _chamberDataView(world).values()) {
    if (chamber.isDynamic) count++;
  }
  return count;
};

/**
 * @param world the world to read
 * @returns the coords of all dynamic chambers
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getDynamicChamberCoords = (world: World): bigint[] => {
  const result: bigint[] = [];
  for (const chamber of _chamberDataView(world).values()) {
    if (chamber.isDynamic) result.push(chamber.coord);
  }
  return result;
};

/**
 * @param world the world to read
 * @returns the token ids of all dynamic chambers
 * @throws {@link MissingViewError} if the world carries no `chamberData` view
 */
export const getDynamicChamberTokenIds = (world: World): bigint[] => {
  const result: bigint[] = [];
  for (const chamber of _chamberDataView(world).values()) {
    if (chamber.isDynamic) result.push(chamber.tokenId);
  }
  return result;
};

//--------------------------------
// TokenSvg — original token SVGs, display-only
//

/**
 * @param world the world to read
 * @param tokenId the token to look up
 * @returns the token's original on-chain SVG (display-only), or `undefined`
 * @throws {@link MissingViewError} if the world carries no `tokenSvg` view
 *   (e.g. the frozen goerli world)
 */
export const getTokenSvg = (world: World, tokenId: BigIntish): string | undefined =>
  _tokenSvgView(world).get(toBigInt(tokenId));

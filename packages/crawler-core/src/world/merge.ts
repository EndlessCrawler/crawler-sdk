/**
 * The pure merge — how live-fetched chambers fold into an immutable world:
 * world + converted record → a **new** `World` value (the `Crawler` swaps it and
 * fires the coarse signal; see `SDK_SPECS.md` §The `Crawler` client, read model).
 */
import type { DataSchema } from '../schema/schema';
import type { ConvertedToken } from './converter';
import type { World, WorldViews } from './types';

/**
 * Folds one converted token into a world, purely.
 *
 * Adds the `tokenCoord` placement and the `chamberData` record (and the original
 * SVG when present), creating a view the world didn't carry yet where needed.
 * The input world is not mutated.
 *
 * @param world the current world value
 * @param tokenId the imported token
 * @param converted the converter's output for the token
 * @returns a new {@link World} value with the token folded in
 */
export const mergeConvertedToken = <S extends DataSchema>(
  world: World<S>,
  tokenId: bigint,
  converted: ConvertedToken<S>,
): World<S> => {
  const tokenCoord = new Map(world.views.tokenCoord ?? []);
  tokenCoord.set(tokenId, converted.chamberData.coord);

  const chamberData = new Map(world.views.chamberData ?? []);
  chamberData.set(converted.chamberData.coord, converted.chamberData);

  let tokenSvg = world.views.tokenSvg;
  if (converted.svg !== undefined) {
    const svgs = new Map(tokenSvg ?? []);
    svgs.set(tokenId, converted.svg);
    tokenSvg = svgs;
  }

  const views: WorldViews<S> = {
    ...world.views,
    tokenCoord,
    chamberData,
    ...(tokenSvg ? { tokenSvg } : {}),
  };

  return { ...world, views };
};

import type { WorldHandle } from '@avante/crawler-core';

// Route slugs are separator-less (SPECS §apps/sdk-explorer): the coordinate
// schema parses any separator, URLs emit none ('S1W1'). The schema's default
// separator stays canonical everywhere else.
export const routeSlug = (world: WorldHandle, coord: bigint): string | null =>
  world.coords.name === 'news'
    ? world.coords.coordToSlug(coord, '')
    : world.coords.coordToSlug(coord);

export const worldPath = (worldName: string): string => `/world/${worldName}`;

export const chamberPath = (worldName: string, slug: string): string =>
  `/world/${worldName}/chamber/${slug}`;

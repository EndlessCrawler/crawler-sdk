'use client';

/**
 * The one chamber-lookup hook — one base hook, derived aliases (SPECS
 * §`crawler-react`): a {@link ChamberLocator} accepts any key form
 * (`{ tokenId? , coord?, slug?, compass? }`, first-present-wins).
 */
import type {
  Chamber,
  ChamberCC,
  ChamberEC,
  ChamberLocator,
  DataSchema,
  ec,
} from '@avante/crawler-core';
import { useMemo } from 'react';
import { useWorldSchema } from './useWorldSchema';

/**
 * @param locator the chamber key, in any form
 * @param worldName the world to resolve (optional — see `useWorldSchema`)
 * @returns the {@link Chamber}, or `undefined` — a new identity when its world
 *   merges, stable otherwise (safe as a plain memo/effect dep)
 */
export const useChamberSchema = <S extends DataSchema = DataSchema>(
  locator: ChamberLocator,
  worldName?: string,
): Chamber<S> | undefined => {
  const world = useWorldSchema<S>(worldName);
  // resolution is cheap and pure — run it every render; the coord (a primitive)
  // then keys the memo, so locator object identity never churns the result
  const coord = world.resolveCoord(locator);
  return useMemo(
    () => (coord === undefined ? undefined : world.getChamber(coord)),
    [world, world.data, coord],
  );
};

/** {@link useChamberSchema} bound to the `ec` schema. */
export const useChamberEC = (locator: ChamberLocator, worldName?: string): ChamberEC | undefined =>
  useChamberSchema<typeof ec>(locator, worldName);

/** {@link useChamberSchema} over the built-in schema union. */
export const useChamber = (
  locator: ChamberLocator,
  worldName?: string,
): ChamberEC | ChamberCC | undefined =>
  useChamberSchema(locator, worldName) as ChamberEC | ChamberCC | undefined;

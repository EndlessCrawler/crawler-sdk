'use client';

import type { BigIntish } from '@avante/crawler-core';
import { useMemo } from 'react';
import { useWorldSchema } from './useWorldSchema';

/**
 * @param tokenId the token to look up
 * @param worldName the world to resolve (optional — see `useWorldSchema`)
 * @returns the token's original on-chain SVG (display-only), or `undefined`
 *   when absent — the view (goerli) or the record
 */
export const useTokenSvg = (tokenId: BigIntish, worldName?: string): string | undefined => {
  const world = useWorldSchema(worldName);
  return useMemo(
    () => (world.hasView('tokenSvg') ? world.getTokenSvg(tokenId) : undefined),
    [world, world.data, tokenId],
  );
};

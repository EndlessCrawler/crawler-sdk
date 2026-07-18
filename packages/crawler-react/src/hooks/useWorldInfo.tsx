'use client';

import type { WorldInfo } from '@avante/crawler-core';
import { useWorldSchema } from './useWorldSchema';

/**
 * @param worldName the world to resolve (optional — see `useWorldSchema`)
 * @returns the world's info block (stable — merges never touch it)
 */
export const useWorldInfo = (worldName?: string): WorldInfo => useWorldSchema(worldName).info;

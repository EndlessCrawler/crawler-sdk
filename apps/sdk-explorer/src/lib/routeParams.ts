import type { WorldHandle } from '@avante/crawler-core';
import { crawler } from '@/lib/crawlerClient';

// Lookup keys are BigIntish (SPECS §apps/sdk-explorer) — decimal and hex url
// segments both parse; anything else is a 400 at the route.
export const parseBigIntish = (value: string): bigint | undefined => {
  try {
    return BigInt(value);
  } catch {
    return undefined;
  }
};

// The world named by the url segment, from the shared Crawler — or undefined
// (a 404 at the route) for names no world is registered under.
export const resolveWorld = (name: string): WorldHandle | undefined => {
  try {
    return crawler.world(name);
  } catch {
    return undefined;
  }
};

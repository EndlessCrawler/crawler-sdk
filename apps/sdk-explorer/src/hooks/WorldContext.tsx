'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import { crawler } from '@/lib/crawlerClient';

//--------------------------------
// The world the menus and browse pages work on. Purely UI state — the SDK has
// no mutable "current world" (see specs/SDK_SPECS.md §The `Crawler` client).
//
type WorldContextType = {
  worldName: string;
  setWorldName(worldName: string): void;
};

const WorldContext = createContext<WorldContextType>({
  worldName: 'mainnet',
  setWorldName: () => null,
});

// Seed from the url so a /world/<name> deep link renders its world on the
// first pass (the /world layout keeps the state in sync on later navigations).
// Unknown names never enter the state — hooks resolving the default world
// would throw UnknownWorldError.
const worldNameFromPath = (pathname: string | null): string | undefined => {
  const name = pathname?.match(/^\/world\/([^/]+)/)?.[1];
  return name !== undefined && crawler.worlds().includes(name) ? name : undefined;
};

export const WorldProvider = ({ children }: React.PropsWithChildren) => {
  const pathname = usePathname();
  const [worldName, setWorldName] = useState(() => worldNameFromPath(pathname) ?? 'mainnet');
  return (
    <WorldContext.Provider value={{ worldName, setWorldName }}>{children}</WorldContext.Provider>
  );
};

export const useSelectedWorld = () => useContext(WorldContext);

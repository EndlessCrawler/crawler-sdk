'use client';

import { createContext, useContext, useState } from 'react';

//--------------------------------
// The world the menus browse. Purely UI state — the SDK has no mutable
// "current world" (see specs/SDK_SPECS.md §The `Crawler` client).
//
type WorldContextType = {
  worldName: string;
  setWorldName(worldName: string): void;
};

const WorldContext = createContext<WorldContextType>({
  worldName: 'mainnet',
  setWorldName: () => null,
});

export const WorldProvider = ({ children }: React.PropsWithChildren) => {
  const [worldName, setWorldName] = useState('mainnet');
  return (
    <WorldContext.Provider value={{ worldName, setWorldName }}>{children}</WorldContext.Provider>
  );
};

export const useSelectedWorld = () => useContext(WorldContext);

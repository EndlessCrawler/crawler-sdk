'use client';

import { createContext, useContext, useState } from 'react';

//--------------------------------
// What the Results panel is showing: a URL to fetch, or data to display as-is.
//
export type Selection =
  | { kind: 'url'; url: string }
  | { kind: 'data'; name: string; data: unknown }
  | null;

type SelectionContextType = {
  selection: Selection;
  setSelection(selection: Selection): void;
};

const SelectionContext = createContext<SelectionContextType>({
  selection: null,
  setSelection: () => null,
});

export const SelectionProvider = ({ children }: React.PropsWithChildren) => {
  const [selection, setSelection] = useState<Selection>(null);
  return (
    <SelectionContext.Provider value={{ selection, setSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);

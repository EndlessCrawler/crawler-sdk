'use client';

import { useWorldNames } from '@avante/crawler-react';
import { useSelectedWorld } from '@/hooks/WorldContext';

// The world the menus browse — UI state, not SDK state (no "current world").
export default function DataSetSelector() {
  const worldNames = useWorldNames();
  const { worldName, setWorldName } = useSelectedWorld();

  return (
    <div>
      world:{' '}
      <select value={worldName} onChange={(e) => setWorldName(e.target.value)}>
        {worldNames.map((name) => (
          <option value={name} key={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

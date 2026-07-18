'use client';

import { useWorldNames } from '@avante/crawler-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { useSelectedWorld } from '@/hooks/WorldContext';

// The /world/:name segment: the url names the browsed world; sync it into
// WorldContext so it drives the provider's defaultWorld and the pages below
// omit world names like a single-world game would. Rendering gates until the
// sync lands (one effect pass), so hooks never resolve the previous world.
export default function WorldLayout({ children }: { children: React.ReactNode }) {
  const { name } = useParams<{ name: string }>();
  const worldNames = useWorldNames();
  const { worldName, setWorldName } = useSelectedWorld();
  const known = name !== undefined && worldNames.includes(name);

  useEffect(() => {
    if (known && name !== worldName) setWorldName(name);
  }, [known, name, worldName, setWorldName]);

  return (
    <div>
      <Header />
      <div className="browse-container">
        {!known ? (
          <div>
            <h3>unknown world [{name}]</h3>
            <Link href="/">&larr; worlds</Link>
          </div>
        ) : worldName !== name ? null : (
          children
        )}
      </div>
    </div>
  );
}

'use client';

import { useWorld, useWorldNames } from '@avante/crawler-react';
import Link from 'next/link';
import Header from '@/components/Header';
import { worldPath } from '@/lib/urls';

function WorldCard({ name }: { name: string }) {
  const world = useWorld(name);
  const info = world.info;
  return (
    <Link href={worldPath(name)}>
      <div className="world-card">
        <h4>{name}</h4>
        <div>
          {info.network} · chain {`${info.chainId}`} · schema {info.schema} ·{' '}
          {world.getChamberCount()} chambers
          {world.hasView('tokenSvg') ? '' : ' · data-only'}
        </div>
      </div>
    </Link>
  );
}

// The browse home: the world index — entry into /world/<name>.
export default function Home() {
  const worldNames = useWorldNames();
  return (
    <div>
      <Header />
      <div className="browse-container">
        <h3>worlds</h3>
        {worldNames.map((name) => (
          <WorldCard key={name} name={name} />
        ))}
      </div>
    </div>
  );
}

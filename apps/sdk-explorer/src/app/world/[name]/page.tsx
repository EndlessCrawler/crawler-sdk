'use client';

import { ChamberSvg, useChambers, useWorld, useWorldInfo } from '@avante/crawler-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { chamberPath, routeSlug } from '@/lib/urls';

// The per-world chamber index: a grid of the world's token SVGs, each linking
// to its chamber detail page. Worlds without a TokenSvg view (goerli) browse
// data-only: the tiles render the chamber's slug instead. World names are
// omitted throughout — the browsed world drives the provider's defaultWorld.
export default function WorldIndexPage() {
  const world = useWorld();
  const info = useWorldInfo();
  const chambers = useChambers();
  const hasSvg = world.hasView('tokenSvg');

  const sorted = useMemo(
    () => [...chambers].sort((a, b) => (a.tokenId < b.tokenId ? -1 : 1)),
    [chambers],
  );

  return (
    <div>
      <h3>{info.name}</h3>
      <div>
        {info.network} · chain {`${info.chainId}`} · schema {info.schema} · {chambers.length}{' '}
        chambers{hasSvg ? '' : ' · data-only (no tokenSvg view)'}
      </div>
      <div className="chamber-grid">
        {sorted.map((chamber) => {
          const slug = routeSlug(chamber.world, chamber.coord);
          if (slug === null) return null;
          return (
            <Link key={`${chamber.coord}`} href={chamberPath(world.name, slug)}>
              <div className="chamber-tile">
                {hasSvg ? (
                  <ChamberSvg chamber={chamber} className="chamber-svg" />
                ) : (
                  <div className="chamber-tile-data">{chamber.slug()}</div>
                )}
                <div className="chamber-tile-name">
                  #{`${chamber.tokenId}`} {chamber.name}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

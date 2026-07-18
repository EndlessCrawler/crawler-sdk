'use client';

import { DirNames } from '@avante/crawler-core';
import { ChamberSvg, useChamber, useChamberNeighbors, useWorld } from '@avante/crawler-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFormatter } from '@/hooks/useFormatter';
import { chamberPath, routeSlug, worldPath } from '@/lib/urls';

// The chamber detail page: the rendered original SVG beside the chamber's
// ChamberData, with clickable doors navigating to their destCoord chambers —
// door-based navigation, dogfooded as UI (SPECS §apps/sdk-explorer). The url
// slug is separator-less; the locator parses any form.
export default function ChamberPage() {
  const { slug } = useParams<{ slug: string }>();
  const world = useWorld();
  const chamber = useChamber({ slug });
  const neighbors = useChamberNeighbors({ slug });
  // the canonical bigint-safe formatter (crawler-api's formatViewData)
  const { formatted } = useFormatter(chamber?.data);

  if (!chamber) {
    return (
      <div>
        <h3>no chamber at [{slug}]</h3>
        <Link href={worldPath(world.name)}>&larr; {world.name}</Link>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Link href={worldPath(world.name)}>&larr; {world.name}</Link>
      </div>
      <h3>
        #{`${chamber.tokenId}`} {chamber.name}
      </h3>
      <div>
        {chamber.slug()} · {chamber.terrain} · yonder {chamber.yonder}
        {chamber.isDynamic ? ' · dynamic' : ''}
      </div>

      <div className="chamber-detail">
        <div className="chamber-pane">
          {chamber.world.hasView('tokenSvg') && (
            <>
              <ChamberSvg chamber={chamber} className="chamber-svg" />
              <a
                href={`/api/data/${world.name}/svg/${chamber.tokenId}`}
                target="_blank"
                rel="noreferrer"
              >
                original svg &#8599;
              </a>
            </>
          )}

          <h4>doors</h4>
          <div className="door-list">
            {neighbors.map(({ door, chamber: dest }) => {
              const label = door.direction !== undefined ? DirNames[door.direction] : 'door';
              const badges = `${door.isEntry ? ' · entry' : ''}${door.isLocked ? ' · locked' : ''}`;
              const destSlug = routeSlug(world, door.destCoord);
              return (
                <div key={door.tile}>
                  {dest && destSlug !== null ? (
                    <Link href={chamberPath(world.name, destSlug)}>
                      {label} &rarr; {dest.name}
                    </Link>
                  ) : (
                    <span>
                      {label} &rarr; {destSlug} (unminted)
                    </span>
                  )}
                  {badges}
                </div>
              );
            })}
          </div>
        </div>

        <div className="chamber-pane-fill">
          <h4>ChamberData</h4>
          <pre className="data-pane">{formatted}</pre>
        </div>
      </div>
    </div>
  );
}

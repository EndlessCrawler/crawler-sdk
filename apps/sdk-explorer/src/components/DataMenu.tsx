'use client';

import type { ec, ViewName } from '@avante/crawler-core';
import { useCrawler, useWorld } from '@avante/crawler-react';
import { useMemo } from 'react';
import { ActionDispatcher } from '@/components/Dispatchers';
import { useSelectedWorld } from '@/hooks/WorldContext';

const VIEW_NAMES: ViewName[] = ['worldInfo', 'tokenCoord', 'chamberData', 'tokenSvg'];

export default function DataMenu() {
  const crawler = useCrawler();
  const { worldName } = useSelectedWorld();
  const world = useWorld<typeof ec>(worldName);

  // Chambers
  const chamberCount = world.getChamberCount();
  const tokenIds = useMemo(() => world.getTokenIds(), [world]);
  const firstTokenId = tokenIds[0] ?? 1n;
  const lastTokenId = tokenIds[tokenIds.length - 1] ?? 1n;
  const genesisCoord = world.getTokenCoord(firstTokenId);

  const views = VIEW_NAMES.map((viewName) => (
    <div key={viewName}>
      <hr />
      {'> '}
      {viewName} [{world.hasView(viewName) ? 'present' : 'absent'}]
      <div className="pl-3">
        <ActionDispatcher label="hasView()" onAction={() => world.hasView(viewName)} />
      </div>
    </div>
  ));

  return (
    <div>
      <hr />

      <h4>Crawler</h4>
      <div>
        <ActionDispatcher label="worlds()" onAction={() => crawler.worlds()} />
        <ActionDispatcher label={`world('${worldName}').info`} onAction={() => world.info} />
        <ActionDispatcher label="schema" onAction={() => world.schema} />
      </div>

      <hr />

      <h4>Views</h4>
      <div>{views}</div>

      <hr />

      <h4>Tokens</h4>
      <div>
        <ActionDispatcher
          label={`getTokenCoord(${firstTokenId})`}
          onAction={() => world.getTokenCoord(firstTokenId)}
        />
        <ActionDispatcher
          label={`getTokenCoord(${lastTokenId})`}
          onAction={() => world.getTokenCoord(lastTokenId)}
        />
        <ActionDispatcher label="getTokenCount()" onAction={() => world.getTokenCount()} />
      </div>

      <hr />

      <h4>Chambers</h4>
      <div>
        <ActionDispatcher label="getChamberCount()" onAction={() => chamberCount} />
        <ActionDispatcher
          label={`getChamber(genesis)`}
          onAction={() => world.getChamber(genesisCoord ?? 0n)?.data}
        />
        <ActionDispatcher
          label={`getChamberByTokenId(${lastTokenId})`}
          onAction={() => world.getChamberByTokenId(lastTokenId)?.data}
        />
        <ActionDispatcher
          label="getChamberBySlug('S1,W1')"
          onAction={() => world.getChamberBySlug('S1,W1')?.data}
        />
        <ActionDispatcher
          label="genesis.slug()"
          onAction={() => world.getChamber(genesisCoord ?? 0n)?.slug()}
        />
        <ActionDispatcher
          label="getStaticChamberCount()"
          onAction={() => world.getStaticChamberCount()}
        />
        <ActionDispatcher
          label="getDynamicChamberCount()"
          onAction={() => world.getDynamicChamberCount()}
        />
        <ActionDispatcher
          label="getDynamicChamberTokenIds()"
          onAction={() => world.getDynamicChamberTokenIds()}
        />
        <ActionDispatcher
          label="getDynamicChamberCoords()"
          onAction={() => world.getDynamicChamberCoords()}
        />
      </div>

      <hr />

      <h4>Coords (NEWS — schema-bound)</h4>
      <div>
        <ActionDispatcher
          label="coords.coordToSlug(genesis)"
          onAction={() => world.coords.coordToSlug(genesisCoord ?? 0n)}
        />
        <ActionDispatcher
          label="coords.coordToCompass(genesis)"
          onAction={() => world.coords.coordToCompass(genesisCoord ?? 0n)}
        />
      </div>
    </div>
  );
}

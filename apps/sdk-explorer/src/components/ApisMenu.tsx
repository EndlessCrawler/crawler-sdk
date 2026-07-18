'use client';

import { useWorld } from '@avante/crawler-react';
import { AsyncActionDispatcher, UrlDispatcher } from '@/components/Dispatchers';
import { useSelectedWorld } from '@/hooks/WorldContext';

const fetchJson = async (url: string): Promise<Record<string, unknown>> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[${response.status}] ${await response.text()}`);
  }
  return response.json();
};

// The cached-vs-live compare is UI (SPECS §apps/sdk-explorer): diff the
// converted on-chain route against the matching data route, field by field —
// both serialize through the same bigint-safe response helper, so a JSON
// compare per key is exact. There is no separate compare endpoint.
const compareCachedVsLive = async (worldName: string, tokenId: bigint) => {
  const [cached, live] = await Promise.all([
    fetchJson(`/api/data/${worldName}/token/${tokenId}`),
    fetchJson(`/api/onchain/${worldName}/token/${tokenId}`),
  ]);
  const keys = [...new Set([...Object.keys(cached), ...Object.keys(live)])].sort();
  const diffKeys = keys.filter((key) => JSON.stringify(cached[key]) !== JSON.stringify(live[key]));
  return { equal: diffKeys.length === 0, diffKeys, cached, live };
};

// The route-family console: /api/data (static reads from the loaded worlds)
// and /api/onchain (live reads, served converted to ChamberData).
export default function ApisMenu() {
  const { worldName } = useSelectedWorld();
  const world = useWorld(worldName);
  const tokenIds = world.getTokenIds();
  const firstTokenId = tokenIds[0] ?? 1n;
  const genesisCoord = world.getTokenCoord(firstTokenId) ?? 0n;
  const dataBase = `/api/data/${worldName}`;

  return (
    <div>
      <hr />
      <div>/api/data</div>
      <div>
        <UrlDispatcher label="whole world" url={dataBase} />
        <UrlDispatcher
          label={`chamber/${genesisCoord}`}
          url={`${dataBase}/chamber/${genesisCoord}`}
        />
        <UrlDispatcher label={`token/${firstTokenId}`} url={`${dataBase}/token/${firstTokenId}`} />
        {world.hasView('tokenSvg') && (
          <>
            {/* image/svg+xml — directly linkable, so link it directly */}
            <a
              className="anchor"
              href={`${dataBase}/svg/${firstTokenId}`}
              target="_blank"
              rel="noreferrer"
            >
              svg/{`${firstTokenId}`} &#8599;
            </a>
            <br />
          </>
        )}
      </div>

      <hr />
      <div>/api/onchain</div>
      <div>
        <UrlDispatcher
          label={`token/${firstTokenId} (live, converted)`}
          url={`/api/onchain/${worldName}/token/${firstTokenId}`}
        />
        <AsyncActionDispatcher
          label={`compare cached vs live (token ${firstTokenId})`}
          onAction={() => compareCachedVsLive(worldName, firstTokenId)}
        />
      </div>
    </div>
  );
}

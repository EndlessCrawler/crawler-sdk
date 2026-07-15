'use client';

import { UrlDispatcher } from '@/components/Dispatchers';

// On-chain reads through the /api/read route (crawler-api's contract layer).
// The converted on-chain routes (cached-vs-live ChamberData compare) are rebuilt
// at P7 on the typed P3 contract surface — parked until then.
export default function ApisMenu() {
  return (
    <div>
      <hr />
      <div>/api/read</div>
      <div>
        <UrlDispatcher label="totalSupply" url="/api/read/1/CrawlerToken/totalSupply" />
        <UrlDispatcher label="ownerOf/1" url="/api/read/1/CrawlerToken/ownerOf/1" />
        <UrlDispatcher label="tokenURI/1" url="/api/read/1/CrawlerToken/tokenURI/1" />
      </div>
    </div>
  );
}

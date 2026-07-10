'use client';

import { readViewRecordOrThrow, readViewTotalCount } from '@avante/crawler-api';
import { type EndlessCrawler, ViewName } from '@avante/crawler-core';
import { useCrawler } from '@avante/crawler-react';
import { useMemo } from 'react';
import { AsyncActionDispatcher, UrlDispatcher } from '@/components/Dispatchers';

export default function ApisMenu() {
  const { client } = useCrawler<EndlessCrawler.Module>();

  const tokenCoords = useMemo(() => client.tokenIdToCoord.get(1), [client]);

  const views = useMemo(() => {
    const result = [];
    for (const viewName of client.getViewNames()) {
      const view = client.getView(viewName);
      const count = Object.keys(view.records).length;
      const key =
        viewName === ViewName.tokenIdToCoord ? '1' : (tokenCoords?.coord?.toString() ?? '');
      result.push(
        <div key={viewName}>
          <hr />
          {'_'}
          {viewName} [{count}]
          <div className="pl-3">
            <AsyncActionDispatcher
              label="readViewTotalCount()"
              onAction={() => readViewTotalCount(viewName, {})}
            />
            <AsyncActionDispatcher
              label={`readViewRecordOrThrow(${key})`}
              onAction={() => readViewRecordOrThrow({ viewName, key })}
            />
          </div>
        </div>,
      );
    }
    return result;
  }, [client, tokenCoords]);

  return (
    <div>
      <hr />
      <div>/api/read</div>
      <div>
        <UrlDispatcher label="totalSupply" url="/api/read/1/CrawlerToken/totalSupply" />
        <UrlDispatcher label="ownerOf/1" url="/api/read/1/CrawlerToken/ownerOf/1" />
        <UrlDispatcher label="tokenURI/1" url="/api/read/1/CrawlerToken/tokenURI/1" />
      </div>
      <hr />
      <div>/api/view</div>
      <div>
        <UrlDispatcher label="tokenIdToCoord/1" url="/api/view/1/tokenIdToCoord/1/1" />
        <UrlDispatcher
          label="chamberData/1"
          url="/api/view/1/chamberData/18446744073709551617/1/18446744073709551617/false"
        />
        <UrlDispatcher
          label="chamberData/1+maps"
          url="/api/view/1/chamberData/18446744073709551617/1/18446744073709551617/true"
        />
      </div>
      {views}
    </div>
  );
}

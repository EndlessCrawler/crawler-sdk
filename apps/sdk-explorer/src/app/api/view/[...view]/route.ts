import { readViewRecordOrThrow } from '@avante/crawler-api';
import type { ViewName } from '@avante/crawler-core';
import type { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/apiResponse';
import '@/lib/serverRpc';

// /api/view/:chainId/:viewName/:key/:...args
// e.g. /api/view/1/tokenIdToCoord/1/1
//      /api/view/1/chamberData/18446744073709551617/1/18446744073709551617/false
export async function GET(_req: NextRequest, { params }: { params: Promise<{ view: string[] }> }) {
  const { view } = await params;
  const [chainId, viewName, key] = view;
  // Extra path segments are ignored: readViewRecordOrThrow derives its args from
  // the view's keyToArgs(key), not from the URL (matches the pre-V2 behavior).

  try {
    const data = await readViewRecordOrThrow({
      chainId: Number.parseInt(chainId, 10),
      viewName: viewName as ViewName,
      key,
    });
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: `${error}`, query: view }, 400);
  }
}

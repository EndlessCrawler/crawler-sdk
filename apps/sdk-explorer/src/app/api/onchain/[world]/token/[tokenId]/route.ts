import { assembleTokenPayload } from '@avante/crawler-api';
import { jsonResponse } from '@/lib/apiResponse';
import { getWorldBundle } from '@/lib/crawlerClient';
import { parseBigIntish, resolveWorld } from '@/lib/routeParams';
import { rpcUrls } from '@/lib/serverRpc';

// GET /api/onchain/:world/token/:tokenId
//
// The token read live: the api's assembleTokenPayload (the SDK's single
// fetch/assembly implementation — never re-implemented here), the world's
// converter applied server-side, the converted ChamberData out. The
// cached-vs-live compare is UI — the /apis console diffs this route against
// the matching data route.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ world: string; tokenId: string }> },
) {
  const { world: worldName, tokenId: tokenIdParam } = await params;
  const world = resolveWorld(worldName);
  const converter = getWorldBundle(worldName)?.converter;
  if (!world || !converter) {
    return jsonResponse({ error: `unknown world [${worldName}]` }, { status: 404, request });
  }
  const tokenId = parseBigIntish(tokenIdParam);
  if (tokenId === undefined) {
    return jsonResponse({ error: `invalid tokenId [${tokenIdParam}]` }, { status: 400, request });
  }
  try {
    const rpcUrl = rpcUrls[Number(world.data.chainId)];
    const payload = await assembleTokenPayload(world.data, tokenId, { rpcUrl });
    const converted = converter.convert(tokenId, payload);
    return jsonResponse(converted.chamberData, { request });
  } catch (error) {
    return jsonResponse(
      { error: `${error}`, world: worldName, tokenId: tokenIdParam },
      { status: 502, request },
    );
  }
}

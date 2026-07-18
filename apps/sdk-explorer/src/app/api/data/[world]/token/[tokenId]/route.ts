import { jsonResponse } from '@/lib/apiResponse';
import { parseBigIntish, resolveWorld } from '@/lib/routeParams';

// GET /api/data/:world/token/:tokenId
//
// The same ChamberData lookup by token id (via the TokenCoord view).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ world: string; tokenId: string }> },
) {
  const { world: worldName, tokenId: tokenIdParam } = await params;
  const world = resolveWorld(worldName);
  if (!world?.hasView('tokenCoord') || !world.hasView('chamberData')) {
    return jsonResponse({ error: `unknown world [${worldName}]` }, { status: 404, request });
  }
  const tokenId = parseBigIntish(tokenIdParam);
  if (tokenId === undefined) {
    return jsonResponse({ error: `invalid tokenId [${tokenIdParam}]` }, { status: 400, request });
  }
  const chamber = world.getChamberByTokenId(tokenId);
  if (!chamber) {
    return jsonResponse(
      { error: `no chamber for token [${tokenIdParam}] in [${worldName}]` },
      { status: 404, request },
    );
  }
  return jsonResponse(chamber.data, { request });
}

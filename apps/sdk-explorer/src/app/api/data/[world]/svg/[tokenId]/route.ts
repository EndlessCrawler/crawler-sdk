import { jsonResponse, svgResponse } from '@/lib/apiResponse';
import { parseBigIntish, resolveWorld } from '@/lib/routeParams';

// GET /api/data/:world/svg/:tokenId
//
// The original token SVG, served as image/svg+xml — the chamber's public SVG
// destination (directly linkable / <img>-embeddable). Worlds without a
// TokenSvg view (goerli) 404.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ world: string; tokenId: string }> },
) {
  const { world: worldName, tokenId: tokenIdParam } = await params;
  const world = resolveWorld(worldName);
  if (!world) {
    return jsonResponse({ error: `unknown world [${worldName}]` }, { status: 404, request });
  }
  const tokenId = parseBigIntish(tokenIdParam);
  if (tokenId === undefined) {
    return jsonResponse({ error: `invalid tokenId [${tokenIdParam}]` }, { status: 400, request });
  }
  const svg = world.hasView('tokenSvg') ? world.getTokenSvg(tokenId) : undefined;
  if (svg === undefined) {
    return jsonResponse(
      { error: `no svg for token [${tokenIdParam}] in [${worldName}]` },
      { status: 404, request },
    );
  }
  return svgResponse(svg, { request });
}

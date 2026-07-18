import { jsonResponse } from '@/lib/apiResponse';
import { parseBigIntish, resolveWorld } from '@/lib/routeParams';

// GET /api/data/:world/chamber/:coord
//
// One ChamberData record by coord (BigIntish — decimal and hex both parse).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ world: string; coord: string }> },
) {
  const { world: worldName, coord: coordParam } = await params;
  const world = resolveWorld(worldName);
  if (!world?.hasView('chamberData')) {
    return jsonResponse({ error: `unknown world [${worldName}]` }, { status: 404, request });
  }
  const coord = parseBigIntish(coordParam);
  if (coord === undefined) {
    return jsonResponse({ error: `invalid coord [${coordParam}]` }, { status: 400, request });
  }
  const chamber = world.getChamber(coord);
  if (!chamber) {
    return jsonResponse(
      { error: `no chamber at coord [${coordParam}] in [${worldName}]` },
      { status: 404, request },
    );
  }
  return jsonResponse(chamber.data, { request });
}

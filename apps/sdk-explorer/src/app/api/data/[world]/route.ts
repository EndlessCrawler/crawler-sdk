import { jsonResponse } from '@/lib/apiResponse';
import { getWorldBundle } from '@/lib/crawlerClient';

// GET /api/data/:world
//
// The whole-world payload: the world's stored JSON, canonical form, fully
// usable without the SDK (same-origin by default — see lib/apiResponse.ts).
export async function GET(request: Request, { params }: { params: Promise<{ world: string }> }) {
  const { world } = await params;
  const bundle = getWorldBundle(world);
  if (!bundle) {
    return jsonResponse({ error: `unknown world [${world}]` }, { status: 404, request });
  }
  return jsonResponse(bundle.world, { request });
}

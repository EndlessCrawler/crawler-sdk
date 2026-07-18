// Bigint-safe JSON responses for the API route handlers. NextResponse.json /
// JSON.stringify throw on bigint (chamber records carry coords, token ids, and
// seeds as bigints), so serialize with a replacer that renders bigint as a
// decimal string. The canonical serializer (formatViewData) is for datasets on
// disk, never HTTP responses.
//
// CORS is opt-in per deployment (SPECS §apps/sdk-explorer): no headers by
// default (same-origin); setting EXPLORER_CORS_ORIGINS (comma-separated
// origins, or '*') applies uniformly to both route families — opting in is
// what makes a deployment a remote world source.
const replacer = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value;

const corsOrigins = (process.env.EXPLORER_CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsHeaders = (request: Request | undefined): Record<string, string> => {
  if (corsOrigins.length === 0) return {};
  if (corsOrigins.includes('*')) return { 'access-control-allow-origin': '*' };
  const origin = request?.headers.get('origin');
  return origin && corsOrigins.includes(origin)
    ? { 'access-control-allow-origin': origin, vary: 'Origin' }
    : {};
};

export interface ApiResponseOptions {
  status?: number;
  /** the incoming request — lets the CORS opt-in echo an allowed Origin back */
  request?: Request;
}

export function jsonResponse(
  data: unknown,
  { status = 200, request }: ApiResponseOptions = {},
): Response {
  return new Response(JSON.stringify(data, replacer), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(request) },
  });
}

export function svgResponse(svg: string, { request }: ApiResponseOptions = {}): Response {
  return new Response(svg, {
    status: 200,
    headers: { 'content-type': 'image/svg+xml', ...corsHeaders(request) },
  });
}

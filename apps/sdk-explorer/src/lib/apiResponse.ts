// Bigint-safe JSON responses for the API route handlers. NextResponse.json /
// JSON.stringify throw on bigint (contract reads return bigints like totalSupply),
// so serialize with a replacer that renders bigint as a decimal string.
const replacer = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value;

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, replacer), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

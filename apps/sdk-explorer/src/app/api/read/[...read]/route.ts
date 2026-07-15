import { getWorldContract } from '@avante/crawler-api';
import { loadWorld } from '@avante/crawler-core';
import { allWorlds } from '@avante/crawler-data';
import type { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/apiResponse';
import { rpcUrls } from '@/lib/serverRpc';

// /api/read/:chainId/:contractName/:functionName/:...args
// e.g. /api/read/1/CrawlerToken/totalSupply
//      /api/read/1/CrawlerToken/ownerOf/1
//
// Keep-lights-on over the typed P3 contract surface: the contract binding comes
// from the committed world for the chain, and the url args are coerced here
// (dynamic dispatch over a typed instance is an explorer-side cast by design).
// The real route family is rebuilt at P7.
const worlds = allWorlds.map((json) => loadWorld(json));

const coerceArg = (value: string): unknown =>
  value === 'true' ? true : value === 'false' ? false : /^\d+$/.test(value) ? BigInt(value) : value;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ read: string[] }> }) {
  const { read } = await params;
  const [chainIdParam, contractName, functionName] = read;
  const args = read.slice(3).map(coerceArg);

  try {
    const chainId = Number.parseInt(chainIdParam, 10);
    const world = worlds.find(
      (w) => Number(w.chainId) === chainId && w.contractName === contractName,
    );
    if (!world) {
      throw new Error(`no world bound to contract [${contractName}] on chain [${chainId}]`);
    }
    const contract = getWorldContract(world, { rpcUrl: rpcUrls[chainId] });
    const reads = contract.read as unknown as Record<string, (args: unknown[]) => Promise<unknown>>;
    const data = await reads[functionName](args);
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: `${error}`, query: read }, 400);
  }
}

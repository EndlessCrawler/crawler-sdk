import { readContractOrThrow } from '@avante/crawler-api';
import type { ContractName } from '@avante/crawler-core';
import type { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/apiResponse';
import '@/lib/serverRpc';

// /api/read/:chainId/:contractName/:functionName/:...args
// e.g. /api/read/1/CrawlerToken/totalSupply
//      /api/read/1/CrawlerToken/ownerOf/1
export async function GET(_req: NextRequest, { params }: { params: Promise<{ read: string[] }> }) {
  const { read } = await params;
  const [chainId, contractName, functionName] = read;
  const args = read.slice(3);

  try {
    const data = await readContractOrThrow({
      chainId: Number.parseInt(chainId, 10),
      contractName: contractName as ContractName,
      functionName,
      args,
    });
    return jsonResponse(data);
  } catch (error) {
    return jsonResponse({ error: `${error}`, query: read }, 400);
  }
}

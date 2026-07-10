import {
  type Abi,
  type Address as ViemAddress,
  type PublicClient,
  createPublicClient,
  http,
} from 'viem';
import { type Chain, goerli, mainnet } from 'viem/chains';
import { ChainId, InvalidChainError } from '@avante/crawler-core';
import type { ReadContractOptions } from './types';
import { getContractAbi, getContractAddress } from './contract';

//---------------------
// Public client (viem 2, viem-only)
//
// RPC URLs are caller-supplied (provider-agnostic), not baked in. Register them
// once with setRpcUrl()/setRpcUrls(), or pass `rpcUrl` per call. When none is
// supplied, viem falls back to the chain's own default public RPC.
//

/** chainId → viem chain */
const _chains: Partial<Record<ChainId, Chain>> = {
  [ChainId.Mainnet]: mainnet,
  [ChainId.Goerli]: goerli,
};

/** caller-registered RPC urls, keyed by chainId */
const _rpcUrls: Partial<Record<ChainId, string>> = {};

/** cached public clients, keyed by `${chainId}:${rpcUrl}` */
const _clients = new Map<string, PublicClient>();

/** register the RPC url used to read a chain */
export const setRpcUrl = (chainId: ChainId, rpcUrl: string): void => {
  _rpcUrls[chainId] = rpcUrl;
};

/** register RPC urls for several chains at once */
export const setRpcUrls = (rpcUrls: Partial<Record<ChainId, string>>): void => {
  for (const [chainId, rpcUrl] of Object.entries(rpcUrls)) {
    if (rpcUrl) setRpcUrl(Number(chainId) as ChainId, rpcUrl);
  }
};

/** @returns a (cached) viem PublicClient for the chain, using the caller-supplied RPC url */
export const getPublicClient = (chainId: ChainId, rpcUrl?: string): PublicClient => {
  const chain = _chains[chainId];
  if (!chain) {
    throw new InvalidChainError(null, chainId);
  }
  const url = rpcUrl ?? _rpcUrls[chainId];
  const key = `${chainId}:${url ?? ''}`;
  let client = _clients.get(key);
  if (!client) {
    client = createPublicClient({ chain, transport: http(url) });
    _clients.set(key, client);
  }
  return client;
};

//---------------------
// Read Contract
//

const _resolveChainId = (options: ReadContractOptions): ChainId =>
  (options.chainId as ChainId) ?? ChainId.Mainnet;

const _normalizeArgs = (args: unknown[]): unknown[] =>
  args.map((value) => (value === 'true' ? true : value === 'false' ? false : value));

export const readContractOrThrow = async (options: ReadContractOptions): Promise<unknown> => {
  const chainId = _resolveChainId(options);
  const { contractName, functionName, args, rpcUrl } = options;

  const address = getContractAddress(contractName, chainId) as ViemAddress;
  const abi = getContractAbi(contractName) as Abi;
  const client = getPublicClient(chainId, rpcUrl);

  // will throw on contract error
  return client.readContract({
    address,
    abi,
    functionName,
    args: _normalizeArgs(args),
  });
};

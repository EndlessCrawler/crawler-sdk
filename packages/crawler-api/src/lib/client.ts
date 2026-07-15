/**
 * The internal client layer: chain resolution + cached viem `PublicClient`s.
 *
 * RPC urls are caller-supplied per factory call (provider-agnostic, no global
 * registry). When none is supplied, viem's default public RPC for the chain is
 * used **with a `console.warn`** — never silently (SPECS §`crawler-api`). The
 * chain always comes from the world binding or the caller; there is no default.
 */
import { type BigIntish, biToBigInt } from '@avante/crawler-core';
import { type Chain, createPublicClient, http, type PublicClient } from 'viem';
import { goerli, mainnet, sepolia } from 'viem/chains';
import { UnsupportedChainError } from './errors';

/** chainId → viem chain */
const _chains: Partial<Record<number, Chain>> = {
  1: mainnet,
  5: goerli,
  11155111: sepolia,
};

/** cached public clients, keyed by `${chainId}:${rpcUrl}` */
const _clients = new Map<string, PublicClient>();

/**
 * @returns a (cached) viem `PublicClient` for the chain. `chainId` is `BigIntish`
 * (EVM ids are plain numbers — converted at this boundary, SPECS §Chains). With
 * no `rpcUrl`, the chain's default public RPC is used and a `console.warn` is
 * emitted (once per cached client).
 * @throws UnsupportedChainError when no viem chain is known for the id
 */
export const getPublicClient = (chainId: BigIntish, rpcUrl?: string): PublicClient => {
  const id = Number(biToBigInt(chainId));
  const chain = _chains[id];
  if (!chain) {
    throw new UnsupportedChainError(chainId);
  }
  const key = `${id}:${rpcUrl ?? ''}`;
  let client = _clients.get(key);
  if (!client) {
    if (rpcUrl === undefined) {
      console.warn(
        `[crawler-api] no rpcUrl supplied for chain [${id}] — falling back to the ${chain.name} default public RPC`,
      );
    }
    client = createPublicClient({ chain, transport: http(rpcUrl) });
    _clients.set(key, client);
  }
  return client;
};

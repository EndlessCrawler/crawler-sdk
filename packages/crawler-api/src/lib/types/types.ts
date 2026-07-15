import type { ContractName } from '@avante/crawler-core';

/** @type contract address and abi for on-chain calls */
export interface ContractArtifacts {
  abi: any;
  networks: any;
}

/**
 * On-chain read options; `rpcUrl` is the caller-supplied endpoint (provider-agnostic).
 * Interim shape — the P3 refactor replaces this with per-world typed contract
 * instances (see `specs/SDK_SPECS.md` §`crawler-api`).
 */
export interface ReadOptions {
  chainId?: number;
  rpcUrl?: string; // caller-supplied RPC endpoint for this chain
}

/** @type generic error result from functions */
export interface ErrorResult {
  error: string;
  query?: any;
}

/** @type generic data result from functions */
export interface DataResult {
  data: any;
}

/** @type check if a function result is ErrorResult */
export function isErrorResult(instance: any): instance is ErrorResult {
  return instance && instance.error && typeof instance.error === 'string';
}

/** @type check if a function result is DataResult */
export function isDataResult(instance: any): instance is DataResult {
  return instance && instance.data && typeof instance.data === 'string';
}

/** @type passed to readContract() for on-chain read */
export interface ReadContractOptions extends ReadOptions {
  contractName: ContractName;
  functionName: string;
  args: any[];
}

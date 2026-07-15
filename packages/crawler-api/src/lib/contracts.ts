/**
 * Contract factories: fully-typed viem contract instances (SPECS §`crawler-api`).
 *
 * All addresses and chain ids crossing this surface are `BigIntish`; conversion
 * to viem's `Address` happens here, via core's `bigintish`. Final names ride the
 * surface freeze (SDK plan #7).
 */
import {
  type BigIntish,
  bigIntToAddress,
  type ContractName,
  type World,
} from '@avante/crawler-core';
import {
  type Abi,
  erc20Abi,
  erc721Abi,
  getAddress,
  getContract,
  type GetContractReturnType,
  type PublicClient,
} from 'viem';
import { contractAbis } from './abis';
import { getPublicClient } from './client';

/**
 * A typed read-only viem contract instance (the explicit return type keeps the
 * emitted `.d.ts` a named reference — the expanded form is unserializable).
 */
export type TypedContract<A extends Abi> = GetContractReturnType<A, PublicClient>;

/** options accepted by every contract factory */
export interface ContractOptions {
  /** caller-supplied RPC endpoint; omitted → the chain's default public RPC + a `console.warn` */
  readonly rpcUrl?: string;
}

/** a chain + address binding, for contracts not bound to a `World` */
export interface BoundContractOptions extends ContractOptions {
  readonly chainId: BigIntish;
  readonly contractAddress: BigIntish;
}

/** an explicit-ABI binding for `getTypedContract` */
export interface TypedContractOptions<A extends Abi> extends BoundContractOptions {
  readonly abi: A;
}

/**
 * @returns a typed viem contract instance for an arbitrary contract — the caller
 * supplies the ABI (bundled ABIs: `getContractAbi` / `contractAbis`)
 * @throws UnsupportedChainError when no viem chain is known for `chainId`
 */
export const getTypedContract = <A extends Abi>(
  options: TypedContractOptions<A>,
): TypedContract<A> =>
  getContract({
    abi: options.abi,
    // core converts (BigIntish → padded hex), viem checksums
    address: getAddress(bigIntToAddress(options.contractAddress)),
    client: getPublicClient(options.chainId, options.rpcUrl),
  });

/**
 * @returns the fully-typed viem contract instance for a world's ERC-721 contract —
 * ABI resolved by `world.contractName`, address and chain from the world binding.
 * Pipeline supplement reads (e.g. `coordToSeed`) go through this instance.
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 */
export const getWorldContract = (
  world: World,
  options: ContractOptions = {},
): TypedContract<(typeof contractAbis)[ContractName]> =>
  getTypedContract({
    abi: contractAbis[world.contractName],
    chainId: world.chainId,
    contractAddress: world.contractAddress,
    rpcUrl: options.rpcUrl,
  });

/**
 * @returns the EndlessCrawler Cards contract (`CardsMinter`), typed by its bundled
 * ABI — cards are part of EndlessCrawler but not part of a world binding, so the
 * caller supplies the chain + address.
 * @throws UnsupportedChainError when no viem chain is known for `chainId`
 */
export const getCardsContract = (
  options: BoundContractOptions,
): TypedContract<typeof contractAbis.CardsMinter> =>
  getTypedContract({ ...options, abi: contractAbis.CardsMinter });

/**
 * @returns a typed generic ERC-20 contract (viem's bundled standard ABI) — the
 * caller supplies only the chain + address
 * @throws UnsupportedChainError when no viem chain is known for `chainId`
 */
export const getErc20 = (options: BoundContractOptions): TypedContract<typeof erc20Abi> =>
  getTypedContract({ ...options, abi: erc20Abi });

/**
 * @returns a typed generic ERC-721 contract (viem's bundled standard ABI) — the
 * caller supplies only the chain + address
 * @throws UnsupportedChainError when no viem chain is known for `chainId`
 */
export const getErc721 = (options: BoundContractOptions): TypedContract<typeof erc721Abi> =>
  getTypedContract({ ...options, abi: erc721Abi });

/**
 * World-bound parsed-result helpers (SPECS §`crawler-api`): viem-decoded values,
 * `BigIntish`-normalized, `tokenURI` data-URIs unpacked. Raw metadata out — the
 * caller converts (the pipeline rule); the P4 cache and the P8 watcher both
 * consume `readTokenMetadata`.
 */
import { type BigIntish, type HexString, biToBigInt, type World } from '@avante/crawler-core';
import { getWorldContract } from './contracts';
import type { ContractOptions } from './contracts';
import { InvalidTokenMetadataError } from './errors';

/**
 * Read-time options: the contract binding (`rpcUrl`) plus an optional
 * `blockNumber` to pin the read to a historical block — reading a set of tokens
 * `at` one block gives a consistent chain snapshot (the P4 cache pins a block per
 * run). Omitted → the chain tip.
 */
export interface ReadOptions extends ContractOptions {
  readonly blockNumber?: BigIntish;
}

/** viem per-call read options — `{ blockNumber }` when pinned, else `{}` */
const _callOptions = (options: ReadOptions): { blockNumber?: bigint } =>
  options.blockNumber === undefined ? {} : { blockNumber: biToBigInt(options.blockNumber) };

/** one token's unpacked `tokenURI` payload — raw metadata, never converted here */
export interface TokenMetadata {
  /** the tokenURI JSON, minus the `image` blob (delivered decoded as `svg`) */
  readonly metadata: Record<string, unknown>;
  /** the token's original on-chain SVG, decoded from the metadata `image` data-URI */
  readonly svg: string;
}

/** decode a base64 data-URI to utf-8 text; `undefined` when it isn't one */
const _decodeDataUri = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.startsWith('data:')) {
    return undefined;
  }
  const marker = ';base64,';
  const start = value.indexOf(marker);
  if (start < 0) {
    return undefined;
  }
  const bytes = Uint8Array.from(atob(value.slice(start + marker.length)), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

/**
 * @returns the contract's `totalSupply()` for the world's ERC-721 contract
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 */
export const readTotalSupply = async (
  world: World,
  options: ContractOptions = {},
): Promise<bigint> => getWorldContract(world, options).read.totalSupply();

/**
 * @returns the owner wallet address of a token, as a checksummed `HexString`
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 */
export const readOwnerOf = async (
  world: World,
  tokenId: BigIntish,
  options: ReadOptions = {},
): Promise<HexString> =>
  getWorldContract(world, options).read.ownerOf([biToBigInt(tokenId)], _callOptions(options));

/**
 * Fetches a token's `tokenURI` and unpacks its data-URI: the metadata JSON with
 * the `image` blob lifted out and delivered decoded as `svg`.
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 * @throws InvalidTokenMetadataError when the tokenURI (or its `image`) is not a
 * base64 data-URI, or the metadata is not a JSON object
 */
export const readTokenMetadata = async (
  world: World,
  tokenId: BigIntish,
  options: ContractOptions = {},
): Promise<TokenMetadata> => {
  const id = biToBigInt(tokenId);
  const uri = await getWorldContract(world, options).read.tokenURI([id], _callOptions(options));
  const json = _decodeDataUri(uri);
  if (json === undefined) {
    throw new InvalidTokenMetadataError(id, 'tokenURI is not a base64 data-URI');
  }
  const parsed: unknown = JSON.parse(json);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new InvalidTokenMetadataError(id, 'tokenURI payload is not a JSON object');
  }
  const { image, ...metadata } = parsed as Record<string, unknown>;
  const svg = _decodeDataUri(image);
  if (svg === undefined) {
    throw new InvalidTokenMetadataError(id, 'metadata [image] is not a base64 data-URI');
  }
  return { metadata, svg };
};

/**
 * World-bound parsed-result helpers (SPECS §`crawler-api`): viem-decoded values,
 * `BigIntish`-normalized, `tokenURI` data-URIs unpacked. Raw metadata out — the
 * caller converts (the pipeline rule); the P4 cache and the P8 watcher both
 * consume `readTokenMetadata`.
 */
import { type BigIntish, type HexString, bi, type World } from '@avante/crawler-core';
import { decodeDataUri } from '@avante/crawler-utils/encode';
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
  options.blockNumber === undefined ? {} : { blockNumber: bi.toBigInt(options.blockNumber) };

/** one token's unpacked `tokenURI` payload — raw metadata, never converted here */
export interface TokenMetadata {
  /** the tokenURI JSON, minus the extracted blobs (`image`; `animation_url` when it is one) */
  readonly metadata: Record<string, unknown>;
  /** the token's original on-chain SVG, decoded from the metadata `image` data-URI */
  readonly svg: string;
  /**
   * the token's playable HTML (the chain's own player around the same SVG), decoded
   * from the metadata `animation_url` data-URI; absent when the metadata carries none
   */
  readonly html?: string;
}

/**
 * @returns the contract's `totalSupply()` for the world's ERC-721 contract
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 */
export const readTotalSupply = async (world: World, options: ReadOptions = {}): Promise<bigint> =>
  getWorldContract(world, options).read.totalSupply(_callOptions(options));

/**
 * @returns the owner wallet address of a token, as a checksummed `HexString`
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 */
export const readOwnerOf = async (
  world: World,
  tokenId: BigIntish,
  options: ReadOptions = {},
): Promise<HexString> =>
  getWorldContract(world, options).read.ownerOf([bi.toBigInt(tokenId)], _callOptions(options));

/**
 * Fetches a token's `tokenURI` and unpacks its data-URIs: the metadata JSON with
 * the blob fields lifted out — `image` delivered decoded as `svg`, and
 * `animation_url` (when it is a data-URI blob) delivered decoded as `html`. An
 * `animation_url` that is *not* a data-URI (e.g. a plain link) stays in the
 * metadata as returned.
 * @throws UnsupportedChainError when no viem chain is known for the world's chain
 * @throws InvalidTokenMetadataError when the tokenURI (or its `image`) is not a
 * base64 data-URI, or the metadata is not a JSON object
 */
export const readTokenMetadata = async (
  world: World,
  tokenId: BigIntish,
  options: ReadOptions = {},
): Promise<TokenMetadata> => {
  const id = bi.toBigInt(tokenId);
  const uri = await getWorldContract(world, options).read.tokenURI([id], _callOptions(options));
  const json = decodeDataUri(uri);
  if (json === undefined) {
    throw new InvalidTokenMetadataError(id, 'tokenURI is not a base64 data-URI');
  }
  const parsed: unknown = JSON.parse(json);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new InvalidTokenMetadataError(id, 'tokenURI payload is not a JSON object');
  }
  const { image, animation_url: animationUrl, ...metadata } = parsed as Record<string, unknown>;
  const svg = decodeDataUri(image);
  if (svg === undefined) {
    throw new InvalidTokenMetadataError(id, 'metadata [image] is not a base64 data-URI');
  }
  const html = decodeDataUri(animationUrl);
  if (animationUrl !== undefined && html === undefined) {
    // present but not a blob (e.g. a plain URL) — not ours to extract, keep it raw
    return { metadata: { ...metadata, animation_url: animationUrl }, svg };
  }
  return html === undefined ? { metadata, svg } : { metadata, svg, html };
};

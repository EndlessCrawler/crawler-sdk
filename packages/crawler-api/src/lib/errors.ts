/**
 * The api error set. Each error names its throw sites in TSDoc (`@throws` on the
 * throwing functions), mirroring `crawler-core`'s error conventions.
 */
import type { BigIntish } from '@avante/crawler-core';

/**
 * Thrown when a contract name has no bundled ABI in the artifact registry
 * (`getContractAbi`). The parameter is `string`, not `KnownContractName` — the
 * error exists to guard runtime-cast names (e.g. route params).
 */
export class UnknownContractError extends Error {
  constructor(contractName: string) {
    super(`UnknownContractError: no bundled ABI for contract [${contractName}]`);
    this.name = 'UnknownContractError';
  }
}

/** Thrown by `getPublicClient` when no viem chain is known for the chain id. */
export class UnsupportedChainError extends Error {
  constructor(chainId: BigIntish) {
    super(`UnsupportedChainError: chain [${chainId}] is not supported`);
    this.name = 'UnsupportedChainError';
  }
}

/**
 * Thrown by the contract factories when a caller-supplied viem client is bound
 * to a different chain than the contract binding (`{ client }` wins over
 * `{ rpcUrl }`, but its chain must match).
 */
export class ClientChainMismatchError extends Error {
  constructor(chainId: BigIntish, clientChainId: number) {
    super(
      `ClientChainMismatchError: the supplied client is bound to chain [${clientChainId}], the contract binding to chain [${chainId}]`,
    );
    this.name = 'ClientChainMismatchError';
  }
}

/**
 * Thrown by `assembleTokenPayload` when the world's schema has no payload
 * assembler (mirrors core's `MissingConverterError` on the convert side).
 */
export class MissingAssemblerError extends Error {
  constructor(schema: string) {
    super(`MissingAssemblerError: no payload assembler for schema [${schema}]`);
    this.name = 'MissingAssemblerError';
  }
}

/** Thrown by `readTokenMetadata` when a tokenURI payload cannot be unpacked. */
export class InvalidTokenMetadataError extends Error {
  constructor(tokenId: bigint, message: string) {
    super(`InvalidTokenMetadataError: token [${tokenId}]: ${message}`);
    this.name = 'InvalidTokenMetadataError';
  }
}

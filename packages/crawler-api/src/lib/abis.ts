/**
 * The artifact registry (see `specs/SDK_SPECS.md` §`crawler-api`).
 *
 * ABIs are sourced from the committed artifact JSON (`src/artifacts/*.json`) and
 * derived into the const-asserted, git-ignored `src/generated/abis.ts` by the
 * `gen` script — viem's type inference needs the literal TS form. Every bundled
 * artifact is a registry entry; the world-bindable `ContractName` union (core)
 * is a subset of the registry's `KnownContractName` keys.
 */
import { contractAbis } from '../generated/abis';
import { UnknownContractError } from './errors';

export { contractAbis };

/** Names of every contract with a bundled ABI — the artifact registry keys. */
export type KnownContractName = keyof typeof contractAbis;

/** @returns all contract names with a bundled ABI */
export const getAllContractNames = (): KnownContractName[] =>
  Object.keys(contractAbis) as KnownContractName[];

/**
 * @returns the bundled const-asserted ABI for the contract, fully typed by name
 * @throws UnknownContractError when the (runtime-cast) name has no bundled ABI
 */
export const getContractAbi = <N extends KnownContractName>(
  contractName: N,
): (typeof contractAbis)[N] => {
  if (!(contractName in contractAbis)) {
    throw new UnknownContractError(contractName);
  }
  return contractAbis[contractName];
};

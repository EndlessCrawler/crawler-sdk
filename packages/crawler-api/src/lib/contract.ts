import type { ContractName } from '@avante/crawler-core';
import { InvalidChainError, InvalidContractError } from './types';

import { Contracts } from './abis';

/** @returns All supported contract names */
export const getAllContractNames = (): ContractName[] => {
  return Object.keys(Contracts) as ContractName[];
};

/** @returns a contract's address for the specified chain */
export const getContractAddress = (contractName: ContractName, chainId: number): string => {
  if (!Contracts[contractName]) {
    throw new InvalidContractError(contractName);
  }
  const result = Contracts[contractName].networks[chainId] ?? null;
  if (!result) {
    throw new InvalidChainError(chainId);
  }
  return result;
};

/** @returns a contract's abi for the specified chain */
export const getContractAbi = (contractName: ContractName): any => {
  if (!Contracts[contractName]) {
    throw new InvalidContractError(contractName);
  }
  return Contracts[contractName].abi;
};

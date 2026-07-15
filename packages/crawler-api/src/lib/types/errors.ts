import type { ContractName } from '@avante/crawler-core';

export class InvalidContractError extends Error {
  constructor(contractName: ContractName) {
    super(`InvalidContractError: Invalid contract name [${contractName}]`);
    this.name = 'InvalidContractError';
  }
}

export class InvalidChainError extends Error {
  constructor(chainId: number | null | undefined) {
    super(`InvalidChainError: Chain [${chainId}] is not supported`);
    this.name = 'InvalidChainError';
  }
}

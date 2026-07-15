import { describe, expect, it } from 'vitest';
import { loadWorld, toBigInt } from '@avante/crawler-core';
import { goerliWorld, mainnetWorld } from '@avante/crawler-data';
import { getAllContractNames, getContractAddress } from '../src';

describe('* contracts', () => {
  it('exposes contract names', () => {
    expect(getAllContractNames()).toContain('CrawlerToken');
  });

  it('world contract bindings resolve to the registry addresses', () => {
    // Each world's binding must resolve to the same contract address that
    // getContractAddress() reports for its chain (compared as bigints —
    // immune to case/checksum differences).
    for (const json of [mainnetWorld, goerliWorld]) {
      const world = loadWorld(json);
      const registryAddress = getContractAddress(world.contractName, Number(world.chainId));
      expect(toBigInt(registryAddress), world.name).toBe(world.contractAddress);
    }
  });
});

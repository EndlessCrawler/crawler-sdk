import { loadWorld, biToBigInt } from '@avante/crawler-core';
import goerliData from '@avante/crawler-data/goerli';
import mainnetData from '@avante/crawler-data/mainnet';
import { describe, expect, it, vi } from 'vitest';
import {
  getAllContractNames,
  getCardsContract,
  getContractAbi,
  getErc721,
  getPublicClient,
  getTypedContract,
  getWorldContract,
  type KnownContractName,
  UnknownContractError,
  UnsupportedChainError,
} from '../src';

// Construction-only checks — no RPC call is ever made; an explicit dummy rpcUrl
// keeps the warned public-RPC fallback quiet.
const RPC = 'http://localhost:1';

describe('* abi registry', () => {
  it('bundles every artifact ABI', () => {
    expect(getAllContractNames()).toEqual([
      'CardsMinter',
      'CrawlerGeneratorV1',
      'CrawlerIndex',
      'CrawlerMapperV1',
      'CrawlerPlayer',
      'CrawlerQueryV1',
      'CrawlerRendererV1',
      'CrawlerToken',
    ]);
  });

  it('resolves ABIs by contract name', () => {
    const abi = getContractAbi('CrawlerToken');
    expect(abi.some((entry) => entry.type === 'function' && entry.name === 'tokenURI')).toBe(true);
  });

  it('throws on unknown contract names', () => {
    expect(() => getContractAbi('Nope' as KnownContractName)).toThrow(UnknownContractError);
  });
});

describe('* contract factories', () => {
  it('builds the typed world contract from the binding', () => {
    for (const json of [mainnetData.world, goerliData.world]) {
      const world = loadWorld(json);
      const contract = getWorldContract(world, { rpcUrl: RPC });
      expect(biToBigInt(contract.address), world.name).toBe(world.contractAddress);
      expect(contract.abi, world.name).toBe(getContractAbi(world.contractName));
    }
  });

  it('converts BigIntish addresses at the boundary', () => {
    const address = '0x8E70b94C57b0CBC9807c0F58Bc251f4cD96AcDb0';
    const built = [address, address.toLowerCase(), biToBigInt(address)].map(
      (contractAddress) => getErc721({ chainId: 1, contractAddress, rpcUrl: RPC }).address,
    );
    for (const out of built) {
      expect(biToBigInt(out)).toBe(biToBigInt(address));
      expect(out).toBe(built[0]);
    }
  });

  it('types the Cards contract by the bundled CardsMinter ABI', () => {
    const cards = getCardsContract({ chainId: 1, contractAddress: 123n, rpcUrl: RPC });
    expect(cards.abi).toBe(getContractAbi('CardsMinter'));
  });

  it('getTypedContract takes an explicit ABI', () => {
    const contract = getTypedContract({
      chainId: 1,
      contractAddress: 123n,
      abi: getContractAbi('CrawlerQueryV1'),
      rpcUrl: RPC,
    });
    expect(contract.abi).toBe(getContractAbi('CrawlerQueryV1'));
  });

  it('throws UnsupportedChainError on unknown chains', () => {
    expect(() => getPublicClient(999)).toThrow(UnsupportedChainError);
    expect(() => getErc721({ chainId: 999, contractAddress: 1n })).toThrow(UnsupportedChainError);
  });

  it('warns (once per cached client) when falling back to the default public RPC', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getPublicClient(11155111);
    getPublicClient(11155111);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

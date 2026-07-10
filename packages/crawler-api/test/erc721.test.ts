import { beforeAll, describe, expect, it } from 'vitest';
import { EndlessCrawler, ChainId, ContractName, createClient } from '@avante/crawler-core';
import { mainnetDataSet } from '@avante/crawler-data';
import { readBalanceOf, readOwnerOf, readTotalSupply, setRpcUrl, validateAddress } from '../src';

// Live mainnet reads (goerli is deprecated). RPC is caller-supplied and provider-
// agnostic — override with MAINNET_RPC_URL; the public default just keeps CI honest.
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com';
const TIMEOUT = 30_000;

const _address = [
  '0xD7137B798B67d5bd55E64c9351C4b82492dc97a4',
  '0x3764dfE9Cf29475512AFECcD5F2959D6b527db4b',
  '0x60fA6cCcf05ad4cBe7D5226E5B1122c0C2962a7d',
];

describe('* erc721 (mainnet)', () => {
  const _owners: Record<string, string> = {};

  beforeAll(() => {
    // core client wires up the module so datasets resolve; RPC is set explicitly.
    createClient([mainnetDataSet]) as EndlessCrawler.Module;
    setRpcUrl(ChainId.Mainnet, MAINNET_RPC_URL);
  });

  it(
    'readTotalSupply',
    async () => {
      // no options → defaults to mainnet
      const totalSupply1 = await readTotalSupply(ContractName.CrawlerToken);
      expect(totalSupply1).toBeGreaterThan(0);

      const totalSupply2 = await readTotalSupply(ContractName.CrawlerToken, {
        chainId: ChainId.Mainnet,
      });
      expect(totalSupply2).toBe(totalSupply1);
    },
    TIMEOUT,
  );

  it(
    'readOwnerOf',
    async () => {
      const ownerOf1 = await readOwnerOf(1, ContractName.CrawlerToken);
      expect(validateAddress(ownerOf1)).toBe(true);
      _owners[1] = ownerOf1;

      for (let i = 5; i <= 8; ++i) {
        const ownerOf = await readOwnerOf(i, ContractName.CrawlerToken);
        expect(validateAddress(ownerOf)).toBe(true);
        _owners[i] = ownerOf;
      }
    },
    TIMEOUT,
  );

  it(
    'readBalanceOf',
    async () => {
      const ownerOf1 = await readOwnerOf(1, ContractName.CrawlerToken);
      expect(validateAddress(ownerOf1)).toBe(true);
      _owners[1] = ownerOf1;

      const tokenIds = Object.keys(_owners);
      for (let i = 0; i < tokenIds.length; ++i) {
        const owner = _owners[tokenIds[i]];
        const balance = await readBalanceOf(owner, ContractName.CrawlerToken);
        expect(balance).toBeGreaterThan(0);
      }

      for (let i = 0; i < _address.length; ++i) {
        const balance = await readBalanceOf(_address[i], ContractName.CrawlerToken);
        expect(balance).toBe(0);
      }
    },
    TIMEOUT,
  );
});

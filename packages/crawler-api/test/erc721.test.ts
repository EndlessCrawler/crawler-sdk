import { bi, loadWorld, type World } from '@avante/crawler-core';
import mainnetData from '@avante/crawler-data/mainnet';
import { beforeAll, describe, expect, it } from 'vitest';
import { getWorldContract, readOwnerOf, readTokenMetadata, readTotalSupply } from '../src';

// Live mainnet reads (goerli is dead). RPC is caller-supplied per call —
// override with MAINNET_RPC_URL; the public default just keeps CI honest.
const options = { rpcUrl: process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com' };
const TIMEOUT = 30_000;

describe('* erc721 (live mainnet)', () => {
  let world: World;

  beforeAll(() => {
    world = loadWorld(mainnetData.world);
  });

  it(
    'readTotalSupply',
    async () => {
      const totalSupply = await readTotalSupply(world, options);
      expect(totalSupply).toBeGreaterThanOrEqual(277n);
    },
    TIMEOUT,
  );

  it(
    'readOwnerOf',
    async () => {
      const owner = await readOwnerOf(world, 1, options);
      expect(bi.isHexString(owner)).toBe(true);
      expect(bi.toBigInt(owner)).not.toBe(0n);
    },
    TIMEOUT,
  );

  it(
    'readTokenMetadata unpacks the tokenURI data-URI',
    async () => {
      const { metadata, svg } = await readTokenMetadata(world, 1, options);
      expect(typeof metadata.name).toBe('string');
      expect(Array.isArray(metadata.attributes)).toBe(true);
      expect(metadata.image, 'the image blob is lifted out').toBeUndefined();
      expect(svg.startsWith('<svg')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'typed world-contract reads match the committed world',
    async () => {
      const contract = getWorldContract(world, options);
      const coord = await contract.read.tokenIdToCoord([1n]);
      expect(coord).toBe(world.views.tokenCoord?.get(1n));
      // the pipeline supplement read (SPECS §crawler-api) — through the typed contract
      const seed = await contract.read.coordToSeed([coord]);
      expect(seed.seed).toBe(world.views.chamberData?.get(coord)?.seed);
    },
    TIMEOUT,
  );
});

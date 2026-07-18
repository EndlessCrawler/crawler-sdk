/**
 * The live surface: `watchMints` (poll-based, mocked supply reads) and the
 * payload assemblers (mocked chain reads over a real cached token). The
 * assembled payload's structural compatibility with `crawler-data`'s
 * `EcTokenPayload` is pinned here — by the type-level assignment below and by
 * running the real `ec` converter over it (the api itself never imports
 * `crawler-data` at runtime; it is a devDependency of the tests only).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadWorld, type World } from '@avante/crawler-core';
import { ecConverter, type EcTokenPayload } from '@avante/crawler-data';
import mainnetData from '@avante/crawler-data/mainnet';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assembleEcTokenPayload,
  assembleTokenPayload,
  InvalidTokenMetadataError,
  MissingAssemblerError,
  watchMints,
} from '../src';
import { getWorldContract } from '../src/lib/contracts';
import { readTokenMetadata, readTotalSupply } from '../src/lib/reads';

vi.mock('../src/lib/reads', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/reads')>()),
  readTotalSupply: vi.fn(),
  readTokenMetadata: vi.fn(),
}));
vi.mock('../src/lib/contracts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/contracts')>()),
  getWorldContract: vi.fn(),
}));

const RPC = 'http://localhost:1';
const world = loadWorld(mainnetData.world);

// Token 1's real cache files are the chain simulation: the mocked reads return
// exactly what the live chain returned when the cache was fetched.
const CACHE_DIR = fileURLToPath(
  new URL('../../../cache/data/endless-crawler/mainnet/', import.meta.url),
);
const cachedJson = JSON.parse(readFileSync(join(CACHE_DIR, '1.json'), 'utf8')) as Record<
  string,
  unknown
>;
const cachedSvg = readFileSync(join(CACHE_DIR, '1.svg'), 'utf8');
const { chamber: cachedChamber, ...cachedMetadata } = cachedJson;

/** wire the mocked reads to the cached token-1 chain responses */
const mockChain = (metadata: Record<string, unknown> = cachedMetadata) => {
  vi.mocked(readTokenMetadata).mockResolvedValue({ metadata, svg: cachedSvg });
  const read = {
    tokenIdToCoord: vi.fn().mockResolvedValue(BigInt((cachedChamber as { coord: string }).coord)),
    coordToChamberData: vi.fn().mockResolvedValue(cachedChamber),
  };
  vi.mocked(getWorldContract).mockReturnValue({ read } as unknown as ReturnType<
    typeof getWorldContract
  >);
  return read;
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('assembleEcTokenPayload()', () => {
  it('assembles metadata + struct + svg into the schema token payload', async () => {
    mockChain();
    // the structural pin: the assembled payload IS an EcTokenPayload
    const payload: EcTokenPayload = await assembleEcTokenPayload(world, 1n, { rpcUrl: RPC });
    expect(payload.tokenId).toBe(1n);
    expect(payload.metadata.chamber).toBe(cachedChamber);
    expect(payload.svg).toBe(cachedSvg);
    // the real converter accepts it — assembly feeds world.import as-is
    const converted = ecConverter.convert(1n, payload);
    expect(converted.chamberData.tokenId).toBe(1n);
    expect(converted.chamberData.coord).toBe(BigInt((cachedChamber as { coord: string }).coord));
    expect(converted.svg).toBe(cachedSvg);
  });

  it('reads the struct at the pinned block when one is given', async () => {
    const read = mockChain();
    await assembleEcTokenPayload(world, 1n, { rpcUrl: RPC, blockNumber: 123n });
    expect(read.tokenIdToCoord).toHaveBeenCalledWith([1n], { blockNumber: 123n });
    expect(read.coordToChamberData).toHaveBeenCalledWith(
      [1, BigInt((cachedChamber as { coord: string }).coord), true],
      { blockNumber: 123n },
    );
  });

  it('rejects unusable metadata with InvalidTokenMetadataError', async () => {
    mockChain({ attributes: [] }); // no name, no Chapter
    await expect(assembleEcTokenPayload(world, 1n, { rpcUrl: RPC })).rejects.toThrow(
      InvalidTokenMetadataError,
    );
    mockChain({ name: 'Chamber #1', attributes: [{ trait_type: 'Terrain', value: 'Earth' }] });
    await expect(assembleEcTokenPayload(world, 1n, { rpcUrl: RPC })).rejects.toThrow(/Chapter/);
  });
});

describe('assembleTokenPayload() — the schema-dispatched front door', () => {
  it('dispatches ec worlds to the ec assembler', async () => {
    mockChain();
    const payload = await assembleTokenPayload(world, 1n, { rpcUrl: RPC });
    expect(payload.metadata.chamber).toBe(cachedChamber);
  });

  it('throws MissingAssemblerError for a schema with no assembler', async () => {
    const cncWorld = { ...world, schema: 'cnc' } as World;
    await expect(assembleTokenPayload(cncWorld, 1n, { rpcUrl: RPC })).rejects.toThrow(
      MissingAssemblerError,
    );
  });
});

describe('watchMints() — poll-based mint watcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('baselines on the first poll, then reports new token ids', async () => {
    const supplies = [5n, 5n, 7n];
    vi.mocked(readTotalSupply).mockImplementation(async () => supplies.shift() ?? 7n);
    const mints: bigint[][] = [];
    const stop = watchMints(world, { rpcUrl: RPC, intervalMs: 1000 }, (ids) => {
      mints.push(ids);
    });

    await vi.advanceTimersByTimeAsync(0); // first poll: baseline only
    expect(mints).toEqual([]);
    await vi.advanceTimersByTimeAsync(1000); // unchanged supply: nothing
    expect(mints).toEqual([]);
    await vi.advanceTimersByTimeAsync(1000); // 5n → 7n: the two mints, oldest first
    expect(mints).toEqual([[6n, 7n]]);

    stop();
    await vi.advanceTimersByTimeAsync(5000); // stopped: no further polls
    expect(mints).toEqual([[6n, 7n]]);
  });

  it('a failed poll warns and retries on the next tick', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(readTotalSupply)
      .mockResolvedValueOnce(5n)
      .mockRejectedValueOnce(new Error('rpc down'))
      .mockResolvedValue(6n);
    const mints: bigint[][] = [];
    const stop = watchMints(world, { rpcUrl: RPC, intervalMs: 1000 }, (ids) => {
      mints.push(ids);
    });

    await vi.advanceTimersByTimeAsync(0); // baseline 5n
    await vi.advanceTimersByTimeAsync(1000); // poll fails — warned, not thrown
    expect(warn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000); // recovered: 6n
    expect(mints).toEqual([[6n]]);
    stop();
    warn.mockRestore();
  });
});

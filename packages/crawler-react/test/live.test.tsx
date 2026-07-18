/**
 * The live path — `useLiveWorld` through the provider's zero-config
 * `liveUpdate` prop, with the optional-peer `@avante/crawler-api` mocked (fake
 * watcher + assembler) and persistence against jsdom's localStorage: mints
 * import (plus invalidated neighbours), imports persist, a remount restores,
 * and entries the static world caught up with are pruned.
 */
import type { ChamberData, Crawler, ec } from '@avante/crawler-core';
import { assembleTokenPayload, watchMints } from '@avante/crawler-api';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CrawlerProvider } from '../src';
import { COORD, makeCrawler, makeNorthChamber, NORTH_COORD } from './fixtures';

vi.mock('@avante/crawler-api', () => ({
  watchMints: vi.fn(),
  assembleTokenPayload: vi.fn(),
}));

type OnMint = (tokenIds: bigint[]) => void | Promise<void>;

/** the fake watcher: captures each watch call's onMint for manual firing */
const _watches: { world: { name: string }; options: unknown; onMint: OnMint; stop: () => void }[] =
  [];

/** the fake assembler: payloads for our test converter ARE ChamberData records */
const _mockApi = (crawler: Crawler): void => {
  vi.mocked(watchMints).mockImplementation((world, options, onMint) => {
    const stop = vi.fn();
    _watches.push({ world, options, onMint, stop });
    return stop;
  });
  vi.mocked(assembleTokenPayload).mockImplementation(async (_world, tokenId) => {
    if (tokenId === 2n) return makeNorthChamber() as never;
    // a neighbour re-import: the current record, re-assembled
    const chamber = crawler.world().getChamberByTokenId(tokenId);
    if (!chamber) throw new Error(`no payload for token ${tokenId}`);
    return chamber.data as never;
  });
};

const _liveKeys = (): string[] =>
  Object.keys(localStorage).filter((key) => key.startsWith('@avante/crawler-react:live:'));

beforeEach(() => {
  localStorage.clear();
  _watches.length = 0;
  vi.clearAllMocks();
});

describe('useLiveWorld() via the provider liveUpdate prop', () => {
  it('starts one watcher per world, passing the tuning through', async () => {
    const crawler = makeCrawler();
    _mockApi(crawler);
    render(
      <CrawlerProvider crawler={crawler} liveUpdate={{ rpcUrl: 'http://rpc', intervalMs: 500 }}>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));
    expect(_watches[0].world.name).toBe('testworld');
    expect(_watches[0].options).toMatchObject({ rpcUrl: 'http://rpc', intervalMs: 500 });
  });

  it('imports each mint plus its invalidated neighbours, and persists them', async () => {
    const crawler = makeCrawler();
    _mockApi(crawler);
    render(
      <CrawlerProvider crawler={crawler} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));

    await act(async () => {
      await _watches[0].onMint([2n]);
    });

    // the mint arrived...
    const world = crawler.world<typeof ec>();
    expect(world.getChamberByTokenId(2n)?.coord).toBe(NORTH_COORD);
    // ...and its invalidated neighbour (the genesis chamber) was re-imported
    const assembled = vi.mocked(assembleTokenPayload).mock.calls.map(([, tokenId]) => tokenId);
    expect(assembled).toEqual([2n, 1n]);
    // both imports persisted under the world's binding key
    expect(_liveKeys().length).toBe(1);
    expect(localStorage.getItem(_liveKeys()[0])).toContain('"2"');
  });

  it('restores persisted chambers on mount and prunes caught-up entries', async () => {
    // run one live session that persists token 2
    const first = makeCrawler();
    _mockApi(first);
    const { unmount } = render(
      <CrawlerProvider crawler={first} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));
    await act(async () => {
      await _watches[0].onMint([2n]);
    });
    unmount();

    // a fresh app over the same static world: token 2 restores without any mint
    const second = makeCrawler();
    _mockApi(second);
    render(
      <CrawlerProvider crawler={second} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(second.world().getChamberByTokenId(2n)).toBeDefined());

    // token 1 was persisted too (neighbour re-import), but the static world
    // carries it — the restore pruned it from storage
    const stored = localStorage.getItem(_liveKeys()[0]) ?? '';
    expect(stored).toContain('"2"');
    expect(stored).not.toContain('"1":');
  });

  it('persist: false keeps localStorage untouched', async () => {
    const crawler = makeCrawler();
    _mockApi(crawler);
    render(
      <CrawlerProvider crawler={crawler} liveUpdate={{ persist: false }}>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));
    await act(async () => {
      await _watches[0].onMint([2n]);
    });
    expect(crawler.world().getChamberByTokenId(2n)).toBeDefined();
    expect(_liveKeys()).toEqual([]);
  });

  it('stops the watcher on unmount', async () => {
    const crawler = makeCrawler();
    _mockApi(crawler);
    const { unmount } = render(
      <CrawlerProvider crawler={crawler} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));
    unmount();
    expect(_watches[0].stop).toHaveBeenCalled();
  });

  it('a failed import warns and leaves the world untouched', async () => {
    const crawler = makeCrawler();
    _mockApi(crawler);
    vi.mocked(assembleTokenPayload).mockRejectedValue(new Error('rpc down'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <CrawlerProvider crawler={crawler} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));
    await act(async () => {
      await _watches[0].onMint([2n]);
    });
    expect(warn).toHaveBeenCalledOnce();
    expect(crawler.world().getChamberByTokenId(2n)).toBeUndefined();
    warn.mockRestore();
  });
});

/** the stored format survives a bigint round-trip (ChamberData carries bigints) */
describe('the private persistence format', () => {
  it('round-trips bigints through localStorage', async () => {
    const crawler = makeCrawler();
    _mockApi(crawler);
    const { unmount } = render(
      <CrawlerProvider crawler={crawler} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(_watches.length).toBe(1));
    await act(async () => {
      await _watches[0].onMint([2n]);
    });
    unmount();

    const second = makeCrawler();
    _mockApi(second);
    render(
      <CrawlerProvider crawler={second} liveUpdate>
        <div />
      </CrawlerProvider>,
    );
    await waitFor(() => expect(second.world().getChamberByTokenId(2n)).toBeDefined());
    const restored = second.world<typeof ec>().getChamberByTokenId(2n)?.data as ChamberData<
      typeof ec
    >;
    expect(restored.coord).toBe(NORTH_COORD); // bigint, not string
    expect(restored.seed).toBe(2n);
    expect(restored.doors[0].destCoord).toBe(COORD);
    // the original SVG rode along in the stored converter output
    expect(second.world().getTokenSvg(2n)).toBe('<svg>token 2</svg>');
  });
});

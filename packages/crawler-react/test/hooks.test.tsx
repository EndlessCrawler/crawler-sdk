/**
 * The static hook surface over fake worlds: resolution chain (arg →
 * `defaultWorld` → sole world → typed error), the base-hook + alias model,
 * locator lookups, and merge-driven identity changes.
 */
import { AmbiguousWorldError, createCrawler, type World } from '@avante/crawler-core';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import {
  useChamber,
  useChamberEC,
  useChamberNeighbors,
  useChambers,
  useCrawler,
  useTokenSvg,
  useWorld,
  useWorldEC,
  useWorldInfo,
  useWorldNames,
  useWorldSelector,
} from '../src';
import {
  COORD,
  makeCrawler,
  makeNorthChamber,
  makeWorldJson,
  makeWrapper,
  NORTH_COORD,
  testConverter,
} from './fixtures';

describe('useCrawler() / useWorldNames()', () => {
  it('returns the provided Crawler; throws outside the provider', () => {
    const crawler = makeCrawler();
    const { result } = renderHook(() => useCrawler(), { wrapper: makeWrapper(crawler) });
    expect(result.current).toBe(crawler);
    expect(() => renderHook(() => useCrawler())).toThrow(/CrawlerProvider/);
  });

  it('lists the registered world names', () => {
    const { result } = renderHook(() => useWorldNames(), { wrapper: makeWrapper(makeCrawler()) });
    expect(result.current).toEqual(['testworld']);
  });
});

describe('world-name resolution — arg → defaultWorld → sole world → typed error', () => {
  const twoWorlds = () =>
    createCrawler([
      { world: makeWorldJson(), converter: testConverter },
      { world: makeWorldJson('otherworld'), converter: testConverter },
    ]);

  it('a single-world app needs no world name anywhere', () => {
    const { result } = renderHook(() => useWorldEC(), { wrapper: makeWrapper(makeCrawler()) });
    expect(result.current.name).toBe('testworld');
  });

  it('an explicit argument wins', () => {
    const { result } = renderHook(() => useWorldEC('otherworld'), {
      wrapper: makeWrapper(twoWorlds(), { defaultWorld: 'testworld' }),
    });
    expect(result.current.name).toBe('otherworld');
  });

  it("the provider's defaultWorld covers multi-world apps", () => {
    const { result } = renderHook(() => useWorldEC(), {
      wrapper: makeWrapper(twoWorlds(), { defaultWorld: 'otherworld' }),
    });
    expect(result.current.name).toBe('otherworld');
  });

  it('ambiguity is never guessed', () => {
    expect(() => renderHook(() => useWorldEC(), { wrapper: makeWrapper(twoWorlds()) })).toThrow(
      AmbiguousWorldError,
    );
  });
});

describe('useWorldSchema() and aliases — the stable handle, re-rendering on merges', () => {
  it('returns the stable handle and re-renders when its world merges', () => {
    const crawler = makeCrawler();
    const { result } = renderHook(() => useWorldEC(), { wrapper: makeWrapper(crawler) });
    const handle = result.current;
    expect(handle.getChamberCount()).toBe(1);

    act(() => {
      crawler.world().import(2n, makeNorthChamber());
    });
    expect(result.current).toBe(handle); // the handle is stable
    expect(result.current.getChamberCount()).toBe(2); // ...but reads the merged world
  });

  it('the union form narrows via world.schema', () => {
    const { result } = renderHook(() => useWorld(), { wrapper: makeWrapper(makeCrawler()) });
    expect(result.current.schema.name).toBe('ec');
  });
});

describe('useChamberSchema() and aliases — one lookup hook, any key form', () => {
  it('resolves every locator form', () => {
    const crawler = makeCrawler();
    const { result: bySlug } = renderHook(() => useChamberEC({ slug: 'S1,W1' }), {
      wrapper: makeWrapper(crawler),
    });
    const { result: byToken } = renderHook(() => useChamber({ tokenId: 1n }), {
      wrapper: makeWrapper(crawler),
    });
    const { result: byCoord } = renderHook(() => useChamberEC({ coord: COORD }), {
      wrapper: makeWrapper(crawler),
    });
    const { result: byCompass } = renderHook(
      () => useChamberEC({ compass: { south: 1n, west: 1n } }),
      { wrapper: makeWrapper(crawler) },
    );
    for (const result of [bySlug, byToken, byCoord, byCompass]) {
      expect(result.current?.coord).toBe(COORD);
    }
    expect(bySlug.current?.name).toBe('Chamber #1');
  });

  it('misses resolve to undefined', () => {
    const { result } = renderHook(() => useChamberEC({ tokenId: 99n }), {
      wrapper: makeWrapper(makeCrawler()),
    });
    expect(result.current).toBeUndefined();
  });

  it('identity is stable between merges, new after one (safe as a memo dep)', () => {
    const crawler = makeCrawler();
    const { result, rerender } = renderHook(() => useChamberEC({ coord: COORD }), {
      wrapper: makeWrapper(crawler),
    });
    const before = result.current;
    rerender();
    expect(result.current).toBe(before); // no merge — same identity

    act(() => {
      crawler.world().import(2n, makeNorthChamber());
    });
    expect(result.current).not.toBe(before); // merged — new identity
    expect(result.current?.coord).toBe(COORD); // same chamber
  });
});

describe('useChambers() / useWorldInfo() / useTokenSvg()', () => {
  it('useChambers returns every chamber, updating per merge', () => {
    const crawler = makeCrawler();
    const { result } = renderHook(() => useChambers(), { wrapper: makeWrapper(crawler) });
    expect(result.current.map((chamber) => chamber.tokenId)).toEqual([1n]);
    act(() => {
      crawler.world().import(2n, makeNorthChamber());
    });
    expect(result.current.map((chamber) => chamber.tokenId)).toEqual([1n, 2n]);
  });

  it("useWorldInfo returns the world's info block", () => {
    const { result } = renderHook(() => useWorldInfo(), { wrapper: makeWrapper(makeCrawler()) });
    expect(result.current.name).toBe('testworld');
    expect(result.current.chainId).toBe(1n);
  });

  it('useTokenSvg returns the original SVG, undefined when absent (view or record)', () => {
    const crawler = makeCrawler();
    const { result } = renderHook(() => useTokenSvg(1n), { wrapper: makeWrapper(crawler) });
    expect(result.current).toBe('<svg>token 1</svg>');
    const { result: missing } = renderHook(() => useTokenSvg(99n), {
      wrapper: makeWrapper(crawler),
    });
    expect(missing.current).toBeUndefined();

    // a world with no tokenSvg view: undefined, never a throw
    const { tokenSvg: _dropped, ...withoutSvgView } = makeWorldJson();
    const bare = createCrawler([withoutSvgView]);
    const { result: noView } = renderHook(() => useTokenSvg(1n), { wrapper: makeWrapper(bare) });
    expect(noView.current).toBeUndefined();
  });
});

describe('useChamberNeighbors() — doors resolved to destination chambers', () => {
  it('resolves each door; unminted destinations are undefined until they arrive', () => {
    const crawler = makeCrawler();
    const { result } = renderHook(() => useChamberNeighbors({ slug: 'S1,W1' }), {
      wrapper: makeWrapper(crawler),
    });
    expect(result.current.length).toBe(2); // the fixture chamber's two doors
    expect(result.current.every(({ chamber }) => chamber === undefined)).toBe(true);

    act(() => {
      crawler.world().import(2n, makeNorthChamber()); // mint the north neighbour
    });
    const north = result.current.find(({ door }) => door.destCoord === NORTH_COORD);
    expect(north?.chamber?.tokenId).toBe(2n);
  });

  it('an unresolvable locator yields no neighbors', () => {
    const { result } = renderHook(() => useChamberNeighbors({ slug: 'N9,E9' }), {
      wrapper: makeWrapper(makeCrawler()),
    });
    expect(result.current).toEqual([]);
  });
});

describe('useWorldSelector() — memoized derived reads', () => {
  const countTokens = (world: World): number => world.views.tokenCoord?.size ?? 0;

  it('derives over the immutable world value, re-running per merge', () => {
    const crawler = makeCrawler();
    const { result, rerender } = renderHook(() => useWorldSelector(countTokens), {
      wrapper: makeWrapper(crawler),
    });
    expect(result.current).toBe(1);
    rerender();
    expect(result.current).toBe(1); // stable between merges
    act(() => {
      crawler.world().import(2n, makeNorthChamber());
    });
    expect(result.current).toBe(2);
  });
});

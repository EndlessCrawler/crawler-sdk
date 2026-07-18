import { describe, expect, it } from 'vitest';
import {
  createCrawler,
  Dir,
  DirNames,
  ec,
  flipDoorPosition,
  getChamber,
  getChamberCount,
  getDynamicChamberCount,
  getStaticChamberCount,
  getTokenCoord,
  getTokenCount,
  getTokenIds,
  getTokenSvg,
  hasView,
  loadWorld,
  offsetCoord,
  bi,
  type World,
} from '@avante/crawler-core';
import goerliData from '../src/goerli';
import mainnetData from '../src/mainnet';

const _dirByName = Object.fromEntries(
  Object.entries(DirNames).map(([dir, name]) => [name, Number(dir) as Dir]),
);

describe('static worlds', () => {
  // loadWorld validates the whole file against the ec schema — throwing here IS the test
  const mainnet = loadWorld(mainnetData.world);
  const goerli = loadWorld(goerliData.world);

  it('world bindings', () => {
    expect(mainnet.name).toBe('mainnet');
    expect(mainnet.network).toBe('ethereum');
    expect(mainnet.chainId).toBe(1n);
    expect(mainnet.schema).toBe('ec');
    expect(mainnet.contractAddress).toBe(bi.toBigInt('0x8E70b94C57b0CBC9807c0F58Bc251f4cD96AcDb0'));
    expect(goerli.name).toBe('goerli');
    expect(goerli.chainId).toBe(5n);
  });

  it('each bundle carries the ec converter', () => {
    expect(mainnetData.converter?.schema).toBe('ec');
    expect(goerliData.converter?.schema).toBe('ec');
  });

  it('counts hold the fetch snapshot (mainnet) and the frozen migration (goerli)', () => {
    // mainnet is builder-emitted from the cache — the count only ever grows
    expect(getTokenCount(mainnet)).toBeGreaterThanOrEqual(277);
    expect(getChamberCount(mainnet)).toBe(getTokenCount(mainnet));
    // goerli is frozen as migrated (dead chain)
    expect(getTokenCount(goerli)).toBe(70);
    expect(getChamberCount(goerli)).toBe(70);
    for (const world of [mainnet, goerli]) {
      const dynamic = getDynamicChamberCount(world);
      expect(dynamic).toBeGreaterThan(0);
      expect(getStaticChamberCount(world) + dynamic).toBe(getChamberCount(world));
    }
  });

  it('mainnet ships every original token SVG; goerli never gains the view', () => {
    expect(hasView(mainnet, 'tokenSvg')).toBe(true);
    for (const tokenId of getTokenIds(mainnet)) {
      const svg = getTokenSvg(mainnet, tokenId);
      expect(svg, `mainnet token ${tokenId} svg`).toBeDefined();
      expect(svg, `mainnet token ${tokenId} svg`).toContain('<svg');
    }
    expect(hasView(goerli, 'tokenSvg')).toBe(false);
  });

  it('every token places an existing chamber (provenance intact)', () => {
    for (const world of [mainnet, goerli]) {
      for (const [tokenId, coord] of world.views.tokenCoord ?? []) {
        const chamber = getChamber(world, coord);
        expect(chamber, `${world.name} token ${tokenId}`).toBeDefined();
        expect(chamber?.tokenId).toBe(tokenId);
      }
    }
  });

  it('door invariants: destCoord/destTile derivations, one entry per chamber', () => {
    const _check = (world: World) => {
      for (const chamber of world.views.chamberData?.values() ?? []) {
        expect(chamber.doors.length, `${world.name} ${chamber.coord}`).toBeGreaterThan(0);
        let entries = 0;
        for (const door of chamber.doors) {
          expect(door.direction).toBeDefined();
          if (door.direction === undefined) continue;
          // destCoord is the NEWS offset in the door's direction
          expect(
            door.destCoord,
            `${world.name} ${chamber.coord} ${_dirByName[door.direction]}`,
          ).toBe(offsetCoord(chamber.coord, door.direction));
          // destTile is the flipped door position
          expect(door.destTile).toBe(flipDoorPosition(door.tile, ec.size));
          if (door.isEntry) entries++;
        }
        expect(entries, `${world.name} ${chamber.coord} entry doors`).toBe(1);
        // locked doors ⇒ dynamic chamber
        if (chamber.doors.some((door) => door.isLocked)) {
          expect(chamber.isDynamic).toBe(true);
        }
      }
    };
    _check(mainnet);
    _check(goerli);
  });

  it('the genesis chamber reads through the Crawler', () => {
    const crawler = createCrawler([mainnetData, goerliData]);
    expect(crawler.worlds()).toEqual(['mainnet', 'goerli']);
    const world = crawler.world('mainnet');
    const genesis = world.getChamberByTokenId(1);
    expect(genesis).toBeDefined();
    expect(genesis?.slug()).toBe('S1,W1');
    expect(genesis?.terrain).toBe('earth');
    expect(genesis?.attributes.chapter).toBe(1);
    // door-based navigation reaches a real neighbor
    const east = genesis?.getDoorsTo(Dir.East) ?? [];
    expect(east.length).toBe(1);
    expect(east[0]?.isEntry).toBe(true);
    expect(getTokenCoord(world.data, 4)).toBe(east[0]?.destCoord); // token #4 is S1E1
  });
});

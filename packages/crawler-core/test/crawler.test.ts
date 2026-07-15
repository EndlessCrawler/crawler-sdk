import { describe, expect, it } from 'vitest';
import {
  type ChamberData,
  type Converter,
  createCrawler,
  Dir,
  DuplicateWorldError,
  MissingConverterError,
  offsetCoord,
  UnknownWorldError,
  type WorldUpdatedEvent,
  ec,
} from '../src';
import { COORD, makeWorldJson, NORTH_COORD } from './fixtures';

/** a converter test double: payload is already a ChamberData record */
const _testConverter: Converter<typeof ec, ChamberData<typeof ec>> = {
  schema: 'ec',
  convert: (_tokenId, payload) => ({ chamberData: payload, svg: '<svg/>' }),
};

const _makeNorthChamber = (): ChamberData<typeof ec> => ({
  coord: NORTH_COORD,
  tokenId: 2n,
  name: 'Chamber #2',
  compass: { north: 1n, west: 1n },
  terrain: 'water',
  yonder: 2,
  seed: 2n,
  tilemap: [0, 255],
  doors: [
    {
      tile: 251,
      destCoord: COORD,
      destTile: 11,
      direction: Dir.South,
      isEntry: true,
    },
  ],
  attributes: { chapter: 1, gemType: 'gold', gemPos: 40, coins: 10, worth: 20 },
});

describe('createCrawler()', () => {
  it('registers worlds by name — sync, explicit, isolated', () => {
    const crawler = createCrawler([makeWorldJson()]);
    expect(crawler.worlds()).toEqual(['testworld']);
    // two crawlers are isolated (no shared global store)
    const other = createCrawler([]);
    expect(other.worlds()).toEqual([]);
  });

  it('rejects duplicate world names', () => {
    expect(() => createCrawler([makeWorldJson(), makeWorldJson()])).toThrow(DuplicateWorldError);
  });

  it('unknown world lookup throws', () => {
    const crawler = createCrawler([makeWorldJson()]);
    expect(() => crawler.world('nope')).toThrow(UnknownWorldError);
  });
});

describe('WorldHandle', () => {
  it('reads delegate to the functional core', () => {
    const crawler = createCrawler([makeWorldJson()]);
    const world = crawler.world('testworld');
    expect(world.info.chainId).toBe(1n);
    expect(world.schema).toBe(ec);
    expect(world.hasView('chamberData')).toBe(true);
    expect(world.hasView('tokenSvg')).toBe(false);
    expect(world.getChamberCount()).toBe(1);
    expect(world.getTokenCount()).toBe(1);
    expect(world.getTokenCoord(1n)).toBe(COORD);
    expect(world.getDynamicChamberCoords()).toEqual([COORD]);
    expect(world.getDynamicChamberTokenIds()).toEqual([1n]);
  });

  it('chambers carry the runtime world back-pointer + computed slug/compass', () => {
    const crawler = createCrawler([makeWorldJson()]);
    const world = crawler.world('testworld');
    const chamber = world.getChamber(COORD);
    expect(chamber).toBeDefined();
    if (!chamber) return;
    expect(chamber.world).toBe(world); // stable handle identity
    expect(chamber.tokenId).toBe(1n);
    expect(chamber.slug()).toBe('S1,W1'); // computed, never stored
    expect(chamber.compass()).toEqual({ west: 1n, south: 1n }); // stored form
    // door-based navigation
    const north = chamber.getDoorsTo(Dir.North);
    expect(north[0]?.destCoord).toBe(NORTH_COORD);
    // slug lookup round-trip
    expect(world.getChamberBySlug('S1,W1')?.coord).toBe(COORD);
    expect(world.getChamberByTokenId(1)?.coord).toBe(COORD);
  });

  it('NEWS math is schema-bound, reached through the world', () => {
    const crawler = createCrawler([makeWorldJson()]);
    const world = crawler.world<typeof ec>('testworld');
    expect(world.coords.name).toBe('news');
    expect(world.coords.offsetCoord(COORD, Dir.North)).toBe(offsetCoord(COORD, Dir.North));
    expect(world.coords.coordToSlug(COORD)).toBe('S1,W1');
  });
});

describe('world.import() — pure merge + coarse signal', () => {
  it('folds a converted token into a new world value and fires the signal', () => {
    const crawler = createCrawler([{ world: makeWorldJson(), converter: _testConverter }]);
    const world = crawler.world('testworld');
    const before = world.data;

    const events: WorldUpdatedEvent[] = [];
    const unsubscribe = crawler.subscribe((event) => events.push(event));

    const imported = world.import(2n, _makeNorthChamber());
    expect(imported.coord).toBe(NORTH_COORD);
    expect(imported.world).toBe(world);

    // the handle now reads the merged world
    expect(world.getChamberCount()).toBe(2);
    expect(world.getTokenCoord(2n)).toBe(NORTH_COORD);
    expect(world.getTokenSvg(2n)).toBe('<svg/>'); // merge created the view
    // the previous value is untouched (pure merge)
    expect(before.views.chamberData?.size).toBe(1);
    expect(before.views.tokenSvg).toBeUndefined();
    // one coarse signal
    expect(events).toEqual([{ world: 'testworld' }]);

    unsubscribe();
    world.import(3n, { ..._makeNorthChamber(), coord: offsetCoord(NORTH_COORD, Dir.North) });
    expect(events.length).toBe(1); // unsubscribed
  });

  it('throws MissingConverterError without a bundled converter', () => {
    const crawler = createCrawler([makeWorldJson()]);
    expect(() => crawler.world('testworld').import(2n, _makeNorthChamber())).toThrow(
      MissingConverterError,
    );
  });
});

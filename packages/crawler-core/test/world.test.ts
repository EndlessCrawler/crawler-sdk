import { describe, expect, it } from 'vitest';
import {
  type ChamberDataJson,
  Dir,
  getChamber,
  getChamberByTokenId,
  getChamberCount,
  getDoorsTo,
  getDynamicChamberCount,
  getStaticChamberCount,
  getTokenCoord,
  getTokenIds,
  getTokenSvg,
  hasView,
  loadWorld,
  MissingViewError,
  WorldValidationError,
} from '../src';
import { COORD, makeWorldJson, NORTH_COORD } from './fixtures';

describe('loadWorld()', () => {
  it('loads a valid world, normalized to bigint', () => {
    const world = loadWorld(makeWorldJson());
    expect(world.name).toBe('testworld');
    expect(world.network).toBe('ethereum');
    expect(world.chainId).toBe(1n);
    expect(world.contractAddress).toBe(0x8e70b94c57b0cbc9807c0f58bc251f4cd96acdb0n);
    expect(world.contractName).toBe('CrawlerToken');
    expect(world.schema).toBe('ec');
    expect(world.views.worldInfo.name).toBe('testworld');
    // keys and values are bigint in memory
    expect(world.views.tokenCoord?.get(1n)).toBe(COORD);
    const chamber = world.views.chamberData?.get(COORD);
    expect(chamber).toBeDefined();
    expect(chamber?.coord).toBe(COORD);
    expect(chamber?.tokenId).toBe(1n);
    expect(chamber?.seed).toBe(1n);
    expect(chamber?.terrain).toBe('earth');
    expect(chamber?.compass).toEqual({ west: 1n, south: 1n });
    // doors: readable direction names parse back to Dir
    expect(chamber?.doors[0]).toEqual({
      tile: 11,
      destCoord: NORTH_COORD,
      destTile: 251,
      direction: Dir.North,
      isEntry: true,
    });
    expect(chamber?.doors[1]?.isLocked).toBe(true);
    expect(chamber?.attributes).toEqual({
      chapter: 1,
      gemType: 'silver',
      gemPos: 42,
      coins: 40,
      worth: 90,
    });
  });

  const _mutated = (mutate: (json: ReturnType<typeof makeWorldJson>) => unknown) => {
    const json = structuredClone(makeWorldJson()) as ReturnType<typeof makeWorldJson> & {
      worldInfo: Record<string, unknown>;
      chamberData: Record<string, ChamberDataJson & Record<string, unknown>>;
    };
    mutate(json);
    return json;
  };

  it('rejects non-conforming worlds', () => {
    // unknown schema
    expect(() =>
      loadWorld(_mutated((json) => Object.assign(json.worldInfo, { schema: 'nope' }))),
    ).toThrow(WorldValidationError);
    // unknown network
    expect(() =>
      loadWorld(_mutated((json) => Object.assign(json.worldInfo, { network: 'polygon' }))),
    ).toThrow(WorldValidationError);
    // unknown contract name
    expect(() =>
      loadWorld(_mutated((json) => Object.assign(json.worldInfo, { contractName: 'Nope' }))),
    ).toThrow(WorldValidationError);
    // undeclared view
    expect(() => loadWorld(_mutated((json) => Object.assign(json, { bogusView: {} })))).toThrow(
      WorldValidationError,
    );
    // out-of-domain terrain
    expect(() =>
      loadWorld(
        _mutated((json) =>
          Object.assign(json.chamberData[COORD.toString()] as object, { terrain: 'lava' }),
        ),
      ),
    ).toThrow(WorldValidationError);
    // out-of-domain attribute value
    expect(() =>
      loadWorld(
        _mutated((json) =>
          Object.assign(json.chamberData[COORD.toString()] as object, {
            attributes: { chapter: 1, gemType: 'plastic', gemPos: 42, coins: 40, worth: 90 },
          }),
        ),
      ),
    ).toThrow(WorldValidationError);
    // key/coord mismatch
    expect(() =>
      loadWorld(
        _mutated((json) =>
          Object.assign(json.chamberData[COORD.toString()] as object, { coord: '123' }),
        ),
      ),
    ).toThrow(WorldValidationError);
    // malformed BigIntish key
    expect(() =>
      loadWorld(_mutated((json) => Object.assign(json, { tokenCoord: { garbage: '1' } }))),
    ).toThrow(WorldValidationError);
  });
});

describe('world reads', () => {
  const world = loadWorld(makeWorldJson());

  it('hasView() is the capability query', () => {
    expect(hasView(world, 'worldInfo')).toBe(true);
    expect(hasView(world, 'tokenCoord')).toBe(true);
    expect(hasView(world, 'chamberData')).toBe(true);
    expect(hasView(world, 'tokenSvg')).toBe(false);
  });

  it('reads accept any BigIntish form', () => {
    expect(getChamber(world, COORD)?.tokenId).toBe(1n);
    expect(getChamber(world, COORD.toString())?.tokenId).toBe(1n);
    expect(getChamber(world, `0x${COORD.toString(16)}`)?.tokenId).toBe(1n);
    expect(getTokenCoord(world, 1)).toBe(COORD);
    expect(getTokenCoord(world, '0x01')).toBe(COORD);
  });

  it('record miss returns undefined; absent view throws MissingViewError', () => {
    expect(getChamber(world, 999n)).toBeUndefined();
    expect(getTokenCoord(world, 999n)).toBeUndefined();
    expect(() => getTokenSvg(world, 1n)).toThrow(MissingViewError);
  });

  it('lookups and counts', () => {
    expect(getChamberByTokenId(world, 1n)?.coord).toBe(COORD);
    expect(getTokenIds(world)).toEqual([1n]);
    expect(getChamberCount(world)).toBe(1);
    expect(getStaticChamberCount(world)).toBe(0);
    expect(getDynamicChamberCount(world)).toBe(1);
  });

  it('door-based navigation', () => {
    const chamber = getChamber(world, COORD);
    expect(chamber).toBeDefined();
    if (!chamber) return;
    const north = getDoorsTo(chamber, Dir.North);
    expect(north.length).toBe(1);
    expect(north[0]?.destCoord).toBe(NORTH_COORD);
    expect(north[0]?.destTile).toBe(251);
    expect(north[0]?.isEntry).toBe(true);
    expect(getDoorsTo(chamber, Dir.South)[0]?.isLocked).toBe(true);
    expect(getDoorsTo(chamber, Dir.Over)).toEqual([]);
  });
});

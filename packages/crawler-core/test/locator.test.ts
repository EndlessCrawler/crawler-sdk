import { describe, expect, it } from 'vitest';
import { createCrawler, loadWorld, MissingViewError, resolveCoord } from '../src';
import { COORD, makeWorldJson, NORTH_COORD } from './fixtures';

describe('resolveCoord() — one resolution path for every key form', () => {
  const world = loadWorld(makeWorldJson());

  it('resolves each locator form to the ChamberData key', () => {
    expect(resolveCoord(world, { tokenId: 1n })).toBe(COORD);
    expect(resolveCoord(world, { tokenId: '0x1' })).toBe(COORD); // hex is always valid input
    expect(resolveCoord(world, { coord: COORD })).toBe(COORD);
    expect(resolveCoord(world, { coord: COORD.toString() })).toBe(COORD);
    expect(resolveCoord(world, { slug: 'S1,W1' })).toBe(COORD);
    expect(resolveCoord(world, { slug: 's1w1' })).toBe(COORD); // any separator parses
    expect(resolveCoord(world, { compass: { south: 1n, west: 1n } })).toBe(COORD);
  });

  it('first field present wins, in tokenId → coord → slug → compass order', () => {
    expect(resolveCoord(world, { tokenId: 1n, slug: 'N9,E9' })).toBe(COORD);
    expect(resolveCoord(world, { coord: NORTH_COORD, slug: 'S1,W1' })).toBe(NORTH_COORD);
    expect(resolveCoord(world, { slug: 'S1,W1', compass: { north: 9n, east: 9n } })).toBe(COORD);
  });

  it('resolves nothing to undefined', () => {
    expect(resolveCoord(world, {})).toBeUndefined();
    expect(resolveCoord(world, { tokenId: 999n })).toBeUndefined(); // unknown token
    expect(resolveCoord(world, { slug: 'not-a-slug' })).toBeUndefined();
    expect(resolveCoord(world, { compass: { north: 1n, south: 1n } })).toBeUndefined(); // invalid
  });

  it('a coord locator resolves the key even for an unspawned chamber', () => {
    // resolveCoord resolves the KEY; existence is the read's concern
    expect(resolveCoord(world, { coord: 12345n })).toBe(12345n);
  });

  it('a tokenId locator keeps the absent-view semantics', () => {
    const { tokenCoord: _dropped, ...views } = makeWorldJson();
    const bare = loadWorld(views);
    expect(() => resolveCoord(bare, { tokenId: 1n })).toThrow(MissingViewError);
  });

  it('the handle exposes it (world.resolveCoord)', () => {
    const crawler = createCrawler([makeWorldJson()]);
    expect(crawler.world('testworld').resolveCoord({ slug: 'S1,W1' })).toBe(COORD);
  });
});

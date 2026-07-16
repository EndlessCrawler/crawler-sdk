/**
 * The converter ↔ world equivalence gate (P5, re-aimed at P6): for every cached
 * mainnet token that exists in the committed **builder-emitted** world, the
 * payload assembled from the cache files converts to the world's `chamberData`
 * record field-for-field (`seed` included), places at the world's `tokenCoord`,
 * and passes its original SVG through to the `tokenSvg` view. With world and
 * cache in lockstep (a rebuild always follows a fetch) every record reproduces
 * exactly; when the cache has been refetched ahead of a rebuild, documented
 * **on-chain lock evolution** is the one tolerance: chambers are dynamic until
 * all doors unlock, and lock state only ever relaxes (`LockedExit` → `Exit`,
 * corridors regenerated; a previously locked door may drop) — a door never gains
 * a lock and never appears out of nowhere — so changed chambers must be dynamic
 * in the world snapshot, keep every snapshot-invariant field, and evolve
 * monotonically. Tokens not yet in the world are held to the door/provenance
 * invariants.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type ChamberData,
  coordToCompass,
  type Door,
  ec,
  flipDoorPosition,
  loadWorld,
  minifyNewsCompass,
  offsetCoord,
} from '@avante/crawler-core';
import { describe, expect, it } from 'vitest';
import { ecConverter, type EcTokenPayload } from '../src';
import mainnetData from '../src/mainnet';

const CACHE_ROOT = fileURLToPath(new URL('../../../cache/', import.meta.url));

interface RegistryEntry {
  readonly dataDir: string;
  readonly rpcEnv: string;
}
const registry = JSON.parse(readFileSync(join(CACHE_ROOT, 'worlds.json'), 'utf8')) as Record<
  string,
  RegistryEntry
>;
const entry = registry.mainnet;
if (!entry) throw new Error('cache/worlds.json has no mainnet world');
const dir = join(CACHE_ROOT, 'data', entry.dataDir);

/** one token's converter payload, assembled from its cache files */
const payloadFor = (id: number): EcTokenPayload => ({
  tokenId: id,
  metadata: JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')) as EcTokenPayload['metadata'],
  svg: readFileSync(join(dir, `${id}.svg`), 'utf8'),
});

describe('ec converter equivalence over the cache', () => {
  const world = loadWorld(mainnetData.world);
  const tokenCoord = world.views.tokenCoord ?? new Map<bigint, bigint>();
  const chamberData = world.views.chamberData ?? new Map();
  const tokenSvg = world.views.tokenSvg ?? new Map<bigint, string>();

  const cachedIds = readdirSync(dir)
    .map((f) => /^(\d+)\.json$/.exec(f))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);

  it('the cache covers the whole world', () => {
    expect(tokenCoord.size).toBeGreaterThan(0);
    expect(cachedIds.length).toBeGreaterThanOrEqual(tokenCoord.size);
  });

  /** the fields no on-chain event can change after mint */
  const snapshotInvariants = (chamber: ChamberData) => {
    const { coord, tokenId, name, compass, terrain, yonder, seed, attributes } = chamber;
    return { coord, tokenId, name, compass, terrain, yonder, seed, attributes };
  };

  const doorsByTile = (chamber: ChamberData) =>
    new Map<number, Door>(chamber.doors.map((door) => [door.tile, door]));

  /** true when the door/lock state is byte-identical between the two snapshots */
  const locksUnchanged = (converted: ChamberData, stored: ChamberData): boolean => {
    const storedDoors = doorsByTile(stored);
    return (
      converted.doors.length === stored.doors.length &&
      converted.doors.every((door) => storedDoors.get(door.tile)?.isLocked === door.isLocked)
    );
  };

  it('reproduces every stored chamber field-for-field (seed included)', () => {
    let compared = 0;
    for (const id of cachedIds) {
      const coord = tokenCoord.get(BigInt(id));
      if (coord === undefined) continue; // fetched after the world's build
      const payload = payloadFor(id);
      const converted = ecConverter.convert(BigInt(id), payload);
      expect(converted.svg, `token ${id} svg passthrough`).toBe(payload.svg);
      expect(tokenSvg.get(BigInt(id)), `token ${id} tokenSvg view`).toBe(payload.svg);
      expect(converted.chamberData.coord, `token ${id} placement`).toBe(coord);
      const stored = chamberData.get(coord);
      expect(stored, `token ${id} stored record`).toBeDefined();
      if (stored === undefined) continue;

      if (locksUnchanged(converted.chamberData, stored)) {
        // in lockstep with the cache — exact reproduction, seed included
        expect(converted.chamberData, `token ${id}`).toEqual(stored);
      } else {
        // on-chain lock evolution: only a dynamic chamber may change, only monotonically
        expect(stored.isDynamic, `token ${id} changed but was not dynamic`).toBe(true);
        expect(
          snapshotInvariants(converted.chamberData),
          `token ${id} snapshot-invariant fields`,
        ).toEqual(snapshotInvariants(stored));
        const storedDoors = doorsByTile(stored);
        for (const door of converted.chamberData.doors) {
          const before = storedDoors.get(door.tile);
          expect(before, `token ${id} door ${door.tile} appeared out of nowhere`).toBeDefined();
          if (before === undefined) continue;
          // a door never gains a lock; everything but the lock is immutable
          if (door.isLocked) expect(before.isLocked, `token ${id} door ${door.tile}`).toBe(true);
          expect({ ...door, isLocked: undefined }, `token ${id} door ${door.tile}`).toEqual({
            ...before,
            isLocked: undefined,
          });
          storedDoors.delete(door.tile);
        }
        for (const gone of storedDoors.values()) {
          expect(gone.isLocked, `token ${id} unlocked door ${gone.tile} vanished`).toBe(true);
        }
      }
      compared++;
    }
    expect(compared).toBe(tokenCoord.size);
  });

  it('tokens not yet in the world hold the door/provenance invariants', () => {
    for (const id of cachedIds) {
      if (tokenCoord.has(BigInt(id))) continue;
      const { chamberData: chamber, svg } = ecConverter.convert(BigInt(id), payloadFor(id));
      expect(chamber.tokenId, `token ${id}`).toBe(BigInt(id));
      expect(svg, `token ${id} svg`).toBeDefined();
      // the stored compass is the packed coord, minified
      expect(chamber.compass, `token ${id} compass`).toEqual(
        minifyNewsCompass(coordToCompass(chamber.coord)),
      );
      expect(chamber.tilemap.length, `token ${id} tilemap`).toBe(256);
      expect(chamber.doors.length, `token ${id} doors`).toBeGreaterThan(0);
      let entries = 0;
      for (const door of chamber.doors) {
        expect(door.direction, `token ${id} door direction`).toBeDefined();
        if (door.direction === undefined) continue;
        expect(door.destCoord, `token ${id} destCoord`).toBe(
          offsetCoord(chamber.coord, door.direction),
        );
        expect(door.destTile, `token ${id} destTile`).toBe(flipDoorPosition(door.tile, ec.size));
        if (door.isEntry) entries++;
      }
      expect(entries, `token ${id} entry doors`).toBe(1);
      if (chamber.doors.some((door) => door.isLocked)) {
        expect(chamber.isDynamic, `token ${id} isDynamic`).toBe(true);
      }
    }
  });
});

/**
 * The P5 equivalence gate (SDK_REFACTOR P5): the struct-fed `ec` converter must
 * reproduce the legacy migration. For every cached mainnet token that exists in
 * the committed migrated world, the payload assembled from the cache files
 * converts to the migrated `chamberData` record field-for-field (`seed` included)
 * and places at the migrated `tokenCoord` — **except documented on-chain lock
 * evolution**: chambers are dynamic until all doors unlock, and between the
 * migration snapshot and the cache's fetch block the community unlocked doors
 * (`LockedExit` → `Exit`, corridors regenerated; some previously locked doors
 * dropped entirely). Lock state only ever relaxes — a door never gains a lock and
 * never appears out of nowhere — so changed chambers must have been dynamic at
 * migration, keep every snapshot-invariant field, and evolve monotonically.
 * Tokens minted after the migration snapshot are held to the door/provenance
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
import { ecConverter, type EcTokenPayload, mainnetWorld } from '../src';

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

describe('ec converter equivalence over the P4 cache', () => {
  const world = loadWorld(mainnetWorld);
  const tokenCoord = world.views.tokenCoord ?? new Map<bigint, bigint>();
  const chamberData = world.views.chamberData ?? new Map();

  const cachedIds = readdirSync(dir)
    .map((f) => /^(\d+)\.json$/.exec(f))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);

  it('the cache covers the whole migrated world', () => {
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
  const locksUnchanged = (converted: ChamberData, migrated: ChamberData): boolean => {
    const migratedDoors = doorsByTile(migrated);
    return (
      converted.doors.length === migrated.doors.length &&
      converted.doors.every((door) => migratedDoors.get(door.tile)?.isLocked === door.isLocked)
    );
  };

  it('reproduces every migrated chamber field-for-field (seed included)', () => {
    let compared = 0;
    let evolved = 0;
    for (const id of cachedIds) {
      const coord = tokenCoord.get(BigInt(id));
      if (coord === undefined) continue; // minted after the migration snapshot
      const payload = payloadFor(id);
      const converted = ecConverter.convert(BigInt(id), payload);
      expect(converted.svg, `token ${id} svg passthrough`).toBe(payload.svg);
      expect(converted.chamberData.coord, `token ${id} placement`).toBe(coord);
      const migrated = chamberData.get(coord);
      expect(migrated, `token ${id} migrated record`).toBeDefined();
      if (migrated === undefined) continue;

      if (locksUnchanged(converted.chamberData, migrated)) {
        // untouched since the migration snapshot — exact reproduction, seed included
        expect(converted.chamberData, `token ${id}`).toEqual(migrated);
      } else {
        // on-chain lock evolution: only a dynamic chamber may change, only monotonically
        evolved++;
        expect(migrated.isDynamic, `token ${id} changed but was not dynamic`).toBe(true);
        expect(
          snapshotInvariants(converted.chamberData),
          `token ${id} snapshot-invariant fields`,
        ).toEqual(snapshotInvariants(migrated));
        const migratedDoors = doorsByTile(migrated);
        for (const door of converted.chamberData.doors) {
          const before = migratedDoors.get(door.tile);
          expect(before, `token ${id} door ${door.tile} appeared out of nowhere`).toBeDefined();
          if (before === undefined) continue;
          // a door never gains a lock; everything but the lock is immutable
          if (door.isLocked) expect(before.isLocked, `token ${id} door ${door.tile}`).toBe(true);
          expect({ ...door, isLocked: undefined }, `token ${id} door ${door.tile}`).toEqual({
            ...before,
            isLocked: undefined,
          });
          migratedDoors.delete(door.tile);
        }
        for (const gone of migratedDoors.values()) {
          expect(gone.isLocked, `token ${id} unlocked door ${gone.tile} vanished`).toBe(true);
        }
      }
      compared++;
    }
    expect(compared).toBe(tokenCoord.size);
    expect(evolved, 'monotone-evolution path exercised').toBeGreaterThan(0);
  });

  it('post-migration tokens hold the door/provenance invariants', () => {
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

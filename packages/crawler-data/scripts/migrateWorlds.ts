/**
 * One-off migration (SDK refactor P2, decision #6): rewrites the legacy per-view
 * JSON (`src/data/<network>/{chamberData,tokenIdToCoord}.json`) into the settled
 * World shape (`src/worlds/<network>.json`) — WorldInfo view, readable string
 * values, `Door[]` with `destCoord`/`destTile`, decimal keys, canonical serializer.
 *
 * Its derivations (NEWS door math, enum→string maps) seed the P5 `ec` converter;
 * the P6 builder re-emits the same shape from the token cache. Goerli is migrated
 * once and stays frozen (dead chain — no cache can ever be fetched).
 *
 * Run from `packages/crawler-data` (after `crawler-core` and `crawler-api` are
 * built): `pnpm run migrate:worlds`
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Dir,
  DirNames,
  ecGemFromChain,
  ecTerrainFromChain,
  flipDoorPosition,
  loadWorld,
  offsetCoord,
} from '@avante/crawler-core';
import { formatViewData } from '@avante/crawler-api';

const _root = join(dirname(fileURLToPath(import.meta.url)), '..');

const NETWORKS = ['mainnet', 'goerli'] as const;
const NEWS_DIRS = [Dir.North, Dir.East, Dir.West, Dir.South];

type LegacyChamber = {
  chapter: number;
  tokenId: number;
  name: string;
  coord: string;
  yonder: number;
  seed: string;
  entryDir: number;
  doors: number[];
  locks: boolean[];
  tilemap: number[];
  bitmap?: string;
  compass: Record<string, number>;
  terrain: number;
  gemPos: number;
  gemType: number;
  coins: number;
  worth: number;
  isDynamic?: boolean;
};

type LegacyView<R> = {
  metadata: {
    chainId: number;
    contractName: string;
    contractAddress: string;
    timestamp: number;
  };
  records: Record<string, R>;
};

const _readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(join(_root, path), 'utf-8')) as T;

const _orThrow = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new Error(`migrate: unmapped ${what}`);
  return value;
};

const _migrateChamber = (record: LegacyChamber) => {
  const coord = BigInt(record.coord);
  const doors = [];
  for (const dir of NEWS_DIRS) {
    const tile = record.doors[dir];
    if (!tile) continue; // 0 = no door on that edge (never locked in the data)
    doors.push({
      tile,
      destCoord: offsetCoord(coord, dir),
      destTile: flipDoorPosition(tile),
      direction: DirNames[dir],
      ...(record.locks[dir] ? { isLocked: true } : {}),
      ...(record.entryDir === dir ? { isEntry: true } : {}),
    });
  }
  const isDynamic = record.isDynamic === true || record.locks.some(Boolean);
  return {
    coord: record.coord,
    tokenId: record.tokenId,
    name: record.name,
    compass: record.compass,
    terrain: _orThrow(ecTerrainFromChain[record.terrain as 1], `terrain [${record.terrain}]`),
    yonder: record.yonder,
    seed: record.seed,
    tilemap: record.tilemap,
    doors,
    ...(isDynamic ? { isDynamic: true } : {}),
    attributes: {
      chapter: record.chapter,
      gemType: _orThrow(ecGemFromChain[record.gemType as 0], `gemType [${record.gemType}]`),
      gemPos: record.gemPos,
      coins: record.coins,
      worth: record.worth,
    },
  };
};

const _migrateWorld = async (network: (typeof NETWORKS)[number]) => {
  const chamberView = await _readJson<LegacyView<LegacyChamber>>(
    `src/data/${network}/chamberData.json`,
  );
  const tokenView = await _readJson<LegacyView<{ coord: string }>>(
    `src/data/${network}/tokenIdToCoord.json`,
  );
  const { chainId, contractName, contractAddress } = chamberView.metadata;

  const worldJson = {
    worldInfo: {
      name: network,
      network: 'ethereum',
      chainId,
      contractAddress,
      contractName,
      schema: 'ec',
      timestamp: new Date().toISOString(),
    },
    tokenCoord: Object.fromEntries(
      Object.entries(tokenView.records).map(([tokenId, { coord }]) => [tokenId, coord]),
    ),
    chamberData: Object.fromEntries(
      Object.entries(chamberView.records).map(([key, record]) => {
        if (key !== record.coord) throw new Error(`migrate: key/coord mismatch at [${key}]`);
        return [key, _migrateChamber(record)];
      }),
    ),
  };

  // the settled shape must load & validate before it is written
  const world = loadWorld(worldJson as never);
  const chambers = world.views.chamberData?.size ?? 0;
  const tokens = world.views.tokenCoord?.size ?? 0;

  await mkdir(join(_root, 'src/worlds'), { recursive: true });
  const out = `src/worlds/${network}.json`;
  await writeFile(join(_root, out), await formatViewData(worldJson));
  console.log(`migrated ${network}: ${tokens} tokens, ${chambers} chambers → ${out}`);
};

for (const network of NETWORKS) {
  await _migrateWorld(network);
}

/**
 * The P6 builder (SPECS §Data pipeline item 3): re-emits each cached world's JSON
 * from the private on-chain archive (`cache/data/<dataDir>/`) — fully offline, no
 * chain calls: every on-chain fact (`seed` included) rides in each cached token's
 * embedded `chamber` struct. Per token, the schema's converter derives the
 * `chamberData` record; the original SVG ships as the `tokenSvg` view.
 *
 * Which worlds are built is declared in `cache/worlds.json` (resolved by fs path —
 * never a package import, so `crawler-data` never depends on `cache`). The world's
 * contract binding comes from its own committed `worldInfo` (never restated);
 * only the `timestamp` is re-stamped. Worlds without a cache directory (goerli —
 * frozen as migrated, dead chain) are never rebuilt.
 *
 * Run from `packages/crawler-data` (after a root `pnpm build` — the script imports
 * the built package entry points): `pnpm run build:worlds`
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type ChamberData,
  type Converter,
  DirNames,
  loadWorld,
  type WorldJson,
} from '@avante/crawler-core';
import { formatViewData } from '@avante/crawler-api';
import { ecConverter } from '@avante/crawler-data';

const _root = join(dirname(fileURLToPath(import.meta.url)), '..');
const _cacheRoot = join(_root, '../../cache');

/** schema name → its converter (the builder covers the schemas with cached worlds) */
const _converters: Record<string, Converter> = { ec: ecConverter };

interface RegistryEntry {
  readonly dataDir: string;
  readonly rpcEnv: string;
}

const _readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf-8')) as T;

/** the in-memory record → the stored `ChamberDataJson` shape (bigints serialize downstream) */
const _chamberToJson = (chamber: ChamberData) => ({
  coord: chamber.coord,
  tokenId: chamber.tokenId,
  name: chamber.name,
  compass: chamber.compass,
  terrain: chamber.terrain,
  yonder: chamber.yonder,
  // canonical bytes32 hex — zero-padded, lowercase
  seed: `0x${chamber.seed.toString(16).padStart(64, '0')}`,
  tilemap: chamber.tilemap,
  doors: chamber.doors.map((door) => ({
    tile: door.tile,
    destCoord: door.destCoord,
    destTile: door.destTile,
    ...(door.direction !== undefined ? { direction: DirNames[door.direction] } : {}),
    ...(door.isLocked ? { isLocked: true } : {}),
    ...(door.isEntry ? { isEntry: true } : {}),
  })),
  ...(chamber.isDynamic ? { isDynamic: true } : {}),
  attributes: chamber.attributes,
});

const _buildWorld = async (name: string, entry: RegistryEntry) => {
  const worldPath = join(_root, `src/worlds/${name}.json`);
  const existing = await _readJson<WorldJson>(worldPath);
  const converter = _converters[existing.worldInfo.schema];
  if (!converter) {
    throw new Error(`build: no converter for schema [${existing.worldInfo.schema}]`);
  }

  const dir = join(_cacheRoot, 'data', entry.dataDir);
  const ids = (await readdir(dir))
    .map((file) => /^(\d+)\.json$/.exec(file))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b);
  if (ids.length === 0) {
    throw new Error(`build: cache directory [${entry.dataDir}] holds no tokens`);
  }

  const tokenCoord: Record<string, bigint> = {};
  const chamberData: Record<string, unknown> = {};
  const tokenSvg: Record<string, string> = {};
  for (const id of ids) {
    const payload = {
      tokenId: id,
      metadata: await _readJson<unknown>(join(dir, `${id}.json`)),
      svg: await readFile(join(dir, `${id}.svg`), 'utf-8'),
    };
    const converted = converter.convert(BigInt(id), payload);
    const key = String(converted.chamberData.coord);
    tokenCoord[String(id)] = converted.chamberData.coord;
    chamberData[key] = _chamberToJson(converted.chamberData);
    if (converted.svg === undefined) {
      throw new Error(`build: token [${id}] converted without its original SVG`);
    }
    tokenSvg[String(id)] = converted.svg;
  }

  const worldJson = {
    // the binding fields are the world's identity — only the build stamp moves
    worldInfo: { ...existing.worldInfo, timestamp: new Date().toISOString() },
    tokenCoord,
    chamberData,
    tokenSvg,
  };

  // the settled shape must load & validate before it is written
  const world = loadWorld(worldJson as unknown as WorldJson);
  const chambers = world.views.chamberData?.size ?? 0;
  const tokens = world.views.tokenCoord?.size ?? 0;
  const svgs = world.views.tokenSvg?.size ?? 0;

  await writeFile(worldPath, formatViewData(worldJson));
  console.log(`built ${name}: ${tokens} tokens, ${chambers} chambers, ${svgs} svgs → ${worldPath}`);
};

const registry = await _readJson<Record<string, RegistryEntry>>(join(_cacheRoot, 'worlds.json'));
for (const [name, entry] of Object.entries(registry)) {
  await _buildWorld(name, entry);
}

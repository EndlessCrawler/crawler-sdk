/**
 * `loadWorld` — parses a stored `WorldJson` into the in-memory `World`:
 * validates against the declared schema, normalizes keys and chain-scale values
 * to `bigint`, and maps readable stored forms (direction names) back to vocabulary.
 */
import { isBigIntish, toBigInt } from '../bigintish';
import type { ChamberData, Door } from '../chamber/chamber';
import { type Dir, DirNames } from '../chamber/constants';
import type { Compass } from '../coords/types';
import { getSchema, isSchemaName } from '../schema/registry';
import type { AttributeSpec, DataSchema } from '../schema/schema';
import { WorldValidationError } from '../errors';
import type {
  ChamberDataJson,
  ContractName,
  Network,
  World,
  WorldInfo,
  WorldJson,
  WorldViews,
} from './types';

const _networks: readonly Network[] = ['ethereum', 'base', 'starknet'];
const _contractNames: readonly ContractName[] = ['CrawlerToken'];

/** readable direction name (any case) → Dir */
const _dirFromName: Record<string, Dir> = Object.fromEntries(
  Object.entries(DirNames).flatMap(([dir, name]) => [
    [name, Number(dir) as Dir],
    [name.toLowerCase(), Number(dir) as Dir],
  ]),
);

const _toBigIntOrThrow = (worldName: string, value: unknown, context: string): bigint => {
  if (!isBigIntish(value)) {
    throw new WorldValidationError(worldName, `${context}: [${String(value)}] is not BigIntish`);
  }
  return toBigInt(value);
};

const _parseCompass = (worldName: string, compass: object, context: string): Compass => {
  const result: Record<string, bigint> = {};
  for (const [direction, value] of Object.entries(compass)) {
    result[direction] = _toBigIntOrThrow(worldName, value, `${context}.compass.${direction}`);
  }
  return result;
};

const _parseDoor = (worldName: string, door: unknown, context: string): Door => {
  if (typeof door !== 'object' || door == null) {
    throw new WorldValidationError(worldName, `${context}: door is not an object`);
  }
  const raw = door as Record<string, unknown>;
  if (typeof raw.tile !== 'number' || typeof raw.destTile !== 'number') {
    throw new WorldValidationError(worldName, `${context}: door tile/destTile must be numbers`);
  }
  let direction: Dir | undefined;
  if (raw.direction != null) {
    direction = _dirFromName[String(raw.direction)];
    if (direction === undefined) {
      throw new WorldValidationError(
        worldName,
        `${context}: unknown door direction [${String(raw.direction)}]`,
      );
    }
  }
  return {
    tile: raw.tile,
    destCoord: _toBigIntOrThrow(worldName, raw.destCoord, `${context}.destCoord`),
    destTile: raw.destTile,
    ...(direction !== undefined ? { direction } : {}),
    ...(raw.isLocked === true ? { isLocked: true } : {}),
    ...(raw.isEntry === true ? { isEntry: true } : {}),
  };
};

const _validateAttribute = (
  worldName: string,
  spec: AttributeSpec,
  value: unknown,
  context: string,
): string | number | boolean => {
  const fail = (): never => {
    throw new WorldValidationError(
      worldName,
      `${context}: value [${String(value)}] does not match its attribute spec`,
    );
  };
  if (spec === 'number' || spec === 'tile') {
    return typeof value === 'number' ? value : fail();
  }
  if (spec === 'string') {
    return typeof value === 'string' ? value : fail();
  }
  if (spec === 'boolean') {
    return typeof value === 'boolean' ? value : fail();
  }
  // explicit readable-string domain
  return typeof value === 'string' && spec.includes(value) ? value : fail();
};

const _parseChamber = (
  worldName: string,
  schema: DataSchema,
  key: string,
  json: ChamberDataJson,
  context: string,
): ChamberData => {
  const coord = _toBigIntOrThrow(worldName, json.coord, `${context}.coord`);
  const keyCoord = _toBigIntOrThrow(worldName, key, `${context} key`);
  if (coord !== keyCoord) {
    throw new WorldValidationError(
      worldName,
      `${context}: key [${key}] does not match record coord [${String(json.coord)}]`,
    );
  }
  if (typeof json.terrain !== 'string' || !schema.terrains.includes(json.terrain)) {
    throw new WorldValidationError(
      worldName,
      `${context}: terrain [${String(json.terrain)}] is not in the [${schema.name}] domain`,
    );
  }
  if (schema.size === 'per-chamber' && json.size == null) {
    throw new WorldValidationError(
      worldName,
      `${context}: schema [${schema.name}] requires a per-chamber size`,
    );
  }
  const attributes: Record<string, string | number | boolean> = {};
  for (const [attribute, spec] of Object.entries(schema.attributes)) {
    attributes[attribute] = _validateAttribute(
      worldName,
      spec,
      json.attributes?.[attribute],
      `${context}.attributes.${attribute}`,
    );
  }
  return {
    coord,
    tokenId: _toBigIntOrThrow(worldName, json.tokenId, `${context}.tokenId`),
    name: String(json.name),
    ...(json.compass ? { compass: _parseCompass(worldName, json.compass, context) } : {}),
    terrain: json.terrain,
    yonder: json.yonder,
    seed: _toBigIntOrThrow(worldName, json.seed, `${context}.seed`),
    tilemap: [...json.tilemap],
    doors: json.doors.map((door, i) => _parseDoor(worldName, door, `${context}.doors[${i}]`)),
    ...(json.size ? { size: json.size } : {}),
    ...(json.isDynamic === true ? { isDynamic: true } : {}),
    attributes,
  };
};

/**
 * Parses and validates a stored world into its in-memory form.
 *
 * @param json the stored world (see `WorldJson`) — typically a `crawler-data`
 *   per-world export
 * @returns the immutable in-memory {@link World}: schema-validated, keys and
 *   chain-scale values normalized to `bigint`
 * @throws {@link WorldValidationError} when the JSON does not conform to its
 *   declared schema (unknown schema, undeclared views, malformed keys or values,
 *   out-of-domain terrain/attribute values)
 */
export const loadWorld = (json: WorldJson): World => {
  const info = json.worldInfo;
  if (info == null) {
    throw new WorldValidationError('?', 'missing the worldInfo view');
  }
  const worldName = String(info.name ?? '?');
  if (!isSchemaName(info.schema)) {
    throw new WorldValidationError(worldName, `unknown schema [${String(info.schema)}]`);
  }
  if (!_networks.includes(info.network)) {
    throw new WorldValidationError(worldName, `unknown network [${String(info.network)}]`);
  }
  if (!_contractNames.includes(info.contractName)) {
    throw new WorldValidationError(
      worldName,
      `unknown contractName [${String(info.contractName)}]`,
    );
  }
  const schema = getSchema(info.schema);

  const worldInfo: WorldInfo = {
    name: worldName,
    network: info.network,
    chainId: _toBigIntOrThrow(worldName, info.chainId, 'worldInfo.chainId'),
    contractAddress: _toBigIntOrThrow(worldName, info.contractAddress, 'worldInfo.contractAddress'),
    contractName: info.contractName,
    schema: info.schema,
    timestamp: String(info.timestamp),
  };

  // views beyond worldInfo must be declared by the schema
  for (const viewName of Object.keys(json)) {
    if (viewName === 'worldInfo') continue;
    if (!(schema.views as readonly string[]).includes(viewName)) {
      throw new WorldValidationError(
        worldName,
        `view [${viewName}] is not declared by schema [${schema.name}]`,
      );
    }
  }

  let tokenCoord: Map<bigint, bigint> | undefined;
  if (json.tokenCoord) {
    tokenCoord = new Map();
    for (const [tokenId, coord] of Object.entries(json.tokenCoord)) {
      tokenCoord.set(
        _toBigIntOrThrow(worldName, tokenId, 'tokenCoord key'),
        _toBigIntOrThrow(worldName, coord, `tokenCoord[${tokenId}]`),
      );
    }
  }

  let chamberData: Map<bigint, ChamberData> | undefined;
  if (json.chamberData) {
    chamberData = new Map();
    for (const [key, record] of Object.entries(json.chamberData)) {
      const chamber = _parseChamber(worldName, schema, key, record, `chamberData[${key}]`);
      chamberData.set(chamber.coord, chamber);
    }
  }

  let tokenSvg: Map<bigint, string> | undefined;
  if (json.tokenSvg) {
    tokenSvg = new Map();
    for (const [tokenId, svg] of Object.entries(json.tokenSvg)) {
      tokenSvg.set(_toBigIntOrThrow(worldName, tokenId, 'tokenSvg key'), String(svg));
    }
  }

  const views: WorldViews = {
    worldInfo,
    ...(tokenCoord ? { tokenCoord } : {}),
    ...(chamberData ? { chamberData } : {}),
    ...(tokenSvg ? { tokenSvg } : {}),
  };

  return {
    name: worldInfo.name,
    network: worldInfo.network,
    chainId: worldInfo.chainId,
    contractAddress: worldInfo.contractAddress,
    contractName: worldInfo.contractName,
    schema: worldInfo.schema,
    views,
  };
};

export type {
  AttributeSpec,
  AttributesOf,
  AttributeValueOf,
  ChamberSize,
  DataSchema,
  SchemaViewName,
  TerrainOf,
} from './schema';
export {
  ec,
  ecGemFromChain,
  ecTerrainFromChain,
  oppositeEcTerrain,
  type EcAttributes,
  type EcGemType,
  type EcTerrain,
} from './schema.ec';
export { cnc, type CncAttributes, type CncTerrain } from './schema.cnc';
export { getSchema, isSchemaName, schemas, type SchemaName } from './registry';

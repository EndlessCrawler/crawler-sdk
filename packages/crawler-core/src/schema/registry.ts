/**
 * The schema registry — resolves a world's declared schema name to its descriptor.
 */
import { cnc } from './schema.cnc';
import { ec } from './schema.ec';
import type { DataSchema } from './schema';

/** All built-in schema descriptors, by name. */
export const schemas = { ec, cnc } as const;

/** The registered schema names — a literal union, never bare `string`. */
export type SchemaName = keyof typeof schemas;

/**
 * @param name a value to test against the registered schema names
 * @returns true if `name` is a registered {@link SchemaName}
 */
export const isSchemaName = (name: unknown): name is SchemaName =>
  typeof name === 'string' && name in schemas;

/**
 * Resolves a schema descriptor by name.
 *
 * @param name the registered schema name (`'ec' | 'cnc'`)
 * @returns the schema's {@link DataSchema} descriptor
 */
export const getSchema = (name: SchemaName): DataSchema => schemas[name];

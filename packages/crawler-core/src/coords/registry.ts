/**
 * The coordinate-schema registry — resolves a schema's declared `coordinateSchema`
 * name to its library at world load. Coordinate schemas are reusable across worlds.
 */
import { type ChamberIdLibrary, chamberId } from './chamberId';
import { type NewsLibrary, news } from './news';
import type { CoordinateSchemaName } from './types';

/** The concrete library type behind each registered coordinate-schema name. */
export interface CoordinateSchemaLibraries {
  news: NewsLibrary;
  'chamber-id': ChamberIdLibrary;
}

const _libraries: { [N in CoordinateSchemaName]: CoordinateSchemaLibraries[N] } = {
  news,
  'chamber-id': chamberId,
};

/**
 * Resolves a coordinate-schema library by name.
 *
 * @param name the registered coordinate-schema name (`'news' | 'chamber-id'`)
 * @returns the coordinate schema's library (typed to the concrete library)
 */
export const getCoordinateSchema = <N extends CoordinateSchemaName>(
  name: N,
): CoordinateSchemaLibraries[N] => _libraries[name];

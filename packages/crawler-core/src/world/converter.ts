/**
 * The generic `Converter` interface — the only converter knowledge core carries.
 *
 * Concrete converters (and their token-payload types) live beside their schema in
 * `crawler-data`, bundled with each per-world subpath export; `createCrawler`
 * builds a schema-keyed registry from what it is handed, so `world.import` always
 * has its converter with zero wiring (see `SDK_SPECS.md` §The `Crawler` client).
 */
import type { ChamberData } from '../chamber/chamber';
import type { DataSchema } from '../schema/schema';
import type { SchemaName } from '../schema/registry';

/**
 * A converter's output for one token: the chamber record (placement rides on
 * `chamberData.coord`) plus the token's original SVG where the payload carries one.
 */
export interface ConvertedToken<S extends DataSchema = DataSchema> {
  readonly chamberData: ChamberData<S>;
  /** the token's original on-chain SVG, display-only (`tokenSvg` view) */
  readonly svg?: string;
}

/**
 * A per-schema pure translator: the schema's token payload in, `ChamberData` out.
 * Synchronous, no fetching inside — on-chain supplements enter through the payload,
 * assembled by the caller (builder or live source).
 *
 * @typeParam S the schema the converter serves
 * @typeParam P the schema's token-payload type (declared beside the converter in `crawler-data`)
 */
export interface Converter<S extends DataSchema = DataSchema, P = unknown> {
  /** the schema this converter serves — keys the `Crawler`'s converter registry */
  readonly schema: SchemaName;
  /**
   * @param tokenId the token being converted
   * @param payload the schema's token payload (cached tokenURI data + optional on-chain supplement)
   * @returns the converted chamber (+ original SVG)
   */
  convert(tokenId: bigint, payload: P): ConvertedToken<S>;
}

/**
 * The core error set. Each error names its throw sites in TSDoc (`@throws` on the
 * throwing functions); `bigintish` owns its own `InvalidBigIntishError`.
 */

/**
 * Thrown when reading against a view the world doesn't carry.
 * `hasView(world, name)` is the capability query; a missing *record* in a present
 * view returns `undefined` — the two misses never conflate.
 */
export class MissingViewError extends Error {
  constructor(worldName: string, viewName: string) {
    super(`MissingViewError: world [${worldName}] does not carry the [${viewName}] view`);
    this.name = 'MissingViewError';
  }
}

/** Thrown by `crawler.world(name)` when no world with that name is registered. */
export class UnknownWorldError extends Error {
  constructor(name: string, known: readonly string[]) {
    super(
      `UnknownWorldError: no world named [${name}] is registered (known: ${
        known.length > 0 ? known.join(', ') : 'none'
      })`,
    );
    this.name = 'UnknownWorldError';
  }
}

/**
 * Thrown by `crawler.world()` (name omitted) when no sole registered world can
 * be derived — several worlds are registered (ambiguity is never guessed), or
 * none is.
 */
export class AmbiguousWorldError extends Error {
  constructor(known: readonly string[]) {
    super(
      known.length === 0
        ? 'AmbiguousWorldError: no world is registered'
        : `AmbiguousWorldError: ${known.length} worlds are registered (${known.join(
            ', ',
          )}) — name one explicitly`,
    );
    this.name = 'AmbiguousWorldError';
  }
}

/** Thrown by `createCrawler` when two worlds share a name. */
export class DuplicateWorldError extends Error {
  constructor(name: string) {
    super(`DuplicateWorldError: a world named [${name}] is already registered`);
    this.name = 'DuplicateWorldError';
  }
}

/** Thrown by `loadWorld` when a world JSON does not conform to its declared schema. */
export class WorldValidationError extends Error {
  constructor(worldName: string, message: string) {
    super(`WorldValidationError: world [${worldName}]: ${message}`);
    this.name = 'WorldValidationError';
  }
}

/**
 * Thrown by `world.import` when no converter is registered for the world's schema
 * (converters ride each world's `crawler-data` subpath export).
 */
export class MissingConverterError extends Error {
  constructor(schema: string) {
    super(`MissingConverterError: no converter registered for schema [${schema}]`);
    this.name = 'MissingConverterError';
  }
}

/**
 * The react error set (mirrors `crawler-core`'s error conventions).
 */

/**
 * Thrown by `useLiveWorld` (surfaced through React render, so error boundaries
 * catch it) when live updates are enabled but the optional peer
 * `@avante/crawler-api` is not installed.
 */
export class CrawlerApiUnavailableError extends Error {
  constructor(cause: unknown) {
    super(
      'CrawlerApiUnavailableError: live updates need the optional peer [@avante/crawler-api] — ' +
        'install it, or drop the `liveUpdate` prop for a fully static app',
      { cause },
    );
    this.name = 'CrawlerApiUnavailableError';
  }
}

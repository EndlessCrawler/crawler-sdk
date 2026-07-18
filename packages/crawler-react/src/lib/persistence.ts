/**
 * Live-chamber persistence — the SDK's only browser-dependent code (SPECS
 * §Data pipeline item 5): live-imported chambers persist in localStorage so a
 * refresh doesn't refetch. Keyed by the world **binding** (chainId + contract
 * address — not the registered name) + tokenId, storing the **converted**
 * record (conversion is deterministic, so storing output avoids re-running
 * converters on every load) in a private, versioned, bigint-safe JSON format —
 * a format bump simply invalidates old entries (the version rides in the key).
 *
 * Internal module — nothing here is public API.
 */
import type { ConvertedToken, WorldHandle } from '@avante/crawler-core';

/** the private format version — bump to invalidate every stored entry */
const FORMAT_VERSION = 1;

/** tokenId (decimal string) → the stored converter output */
type StoredWorld = Record<string, ConvertedToken>;

/** localStorage when the environment has one (SSR/Node: no persistence) */
const _storage = (): Storage | undefined =>
  typeof localStorage === 'undefined' ? undefined : localStorage;

/** the world's storage key — the binding, never the registered name */
const _storageKey = (world: WorldHandle): string =>
  `@avante/crawler-react:live:v${FORMAT_VERSION}:${world.info.chainId}:${world.info.contractAddress.toString(16)}`;

/** bigint-safe private serialization: bigints ride as `{ $bigint: "..." }` */
const _serialize = (value: StoredWorld): string =>
  JSON.stringify(value, (_key, entry: unknown) =>
    typeof entry === 'bigint' ? { $bigint: entry.toString() } : entry,
  );

const _deserialize = (text: string): StoredWorld =>
  JSON.parse(text, (_key, entry: unknown) => {
    if (entry !== null && typeof entry === 'object' && '$bigint' in entry) {
      const wrapped = (entry as { $bigint: unknown }).$bigint;
      if (typeof wrapped === 'string') return BigInt(wrapped);
    }
    return entry;
  }) as StoredWorld;

/** read a world's stored map — `{}` when absent or unreadable (stale format) */
const _read = (storage: Storage, key: string): StoredWorld => {
  const text = storage.getItem(key);
  if (text === null) return {};
  try {
    return _deserialize(text);
  } catch {
    storage.removeItem(key); // unreadable — treat as a format bump
    return {};
  }
};

const _write = (storage: Storage, key: string, entries: StoredWorld): void => {
  if (Object.keys(entries).length === 0) {
    storage.removeItem(key);
  } else {
    storage.setItem(key, _serialize(entries));
  }
};

/** persist one live import's converter output under its world's binding key */
export const persistConvertedToken = (
  world: WorldHandle,
  tokenId: bigint,
  converted: ConvertedToken,
): void => {
  const storage = _storage();
  if (!storage) return;
  const key = _storageKey(world);
  const entries = _read(storage, key);
  entries[tokenId.toString()] = converted;
  _write(storage, key, entries);
};

/**
 * Restore a world's persisted chambers on mount: entries the static world
 * already carries are **pruned** (a `crawler-data` redeploy folded them in);
 * the rest re-enter through the same pure merge (`world.importConverted`).
 */
export const restorePersistedChambers = (world: WorldHandle): void => {
  const storage = _storage();
  if (!storage) return;
  const key = _storageKey(world);
  const entries = _read(storage, key);
  const kept: StoredWorld = {};
  for (const [tokenIdStr, converted] of Object.entries(entries)) {
    const tokenId = BigInt(tokenIdStr);
    if (world.hasView('tokenCoord') && world.getTokenCoord(tokenId) !== undefined) {
      continue; // the static world caught up — prune
    }
    world.importConverted(tokenId, converted);
    kept[tokenIdStr] = converted;
  }
  _write(storage, key, kept);
};

# cache

Private, **never-published** on-chain archive for the Endless Crawler SDK. It stores
the raw `tokenURI` output of every SDK world contract as plain files, so the
`crawler-data` builder can regenerate world JSON offline (no live chain calls for
the map data itself). It lives under `cache/` — not `packages/` — precisely so it
never leaves the repo.

One generic script fetches **any** ERC-721 world; the contract binding
(address / chain / ABI) comes from the `@avante/crawler-data` world resolved by
name, never restated here.

## Layout

```
cache/
  worlds.json                                  # registry: which worlds to cache
  scripts/fetch.ts                             # the one generic fetch script
  data/<dataDir>/                              # dataDir e.g. endless-crawler/mainnet
    <tokenId>.json                             # tokenURI metadata JSON (blob fields extracted;
                                               #   ec: + the on-chain struct embedded as `chamber`)
    <tokenId>.svg                              # the decoded on-chain SVG, pretty-printed
    <tokenId>.html                             # ec only: the decoded animation_url player, pretty-printed
    _cache.json                                # provenance + fetch state (below)
```

Everything under `data/` is fetched, not hand-edited (and is excluded from Biome).

## Registry — `worlds.json`

Lean and declarative. Keyed by **world name** (must match a world exported by
`@avante/crawler-data`) → where to write and which env var holds the RPC URL:

```json
{
  "mainnet": { "dataDir": "endless-crawler/mainnet", "rpcEnv": "MAINNET_RPC_URL" }
}
```

- `dataDir` — the archive path under `data/`, **including the deployment**
  (e.g. `endless-crawler/mainnet`). It carries the full path rather than deriving
  `<game>/<network>`, because `network` alone collides — sepolia is also `ethereum`
  (it would be `endless-crawler/sepolia`).
- `rpcEnv` — the **name** of the environment variable holding the RPC URL (never a
  secret, never a URL). **Required** — the run aborts up front if it is unset (no
  public fallback for the archive; it is rate-limited and unreliable across hundreds
  of tokens).

The registry keyset **is** the coverage: a world not listed is never cached. Goerli
is intentionally absent — its chain is dead and unfetchable; its world stays frozen
as migrated.

## Running a fetch

```sh
# an RPC endpoint is required — the run aborts up front without one.
# a `.env` at the repo root (or in cache/) is auto-loaded — no export needed:
#   MAINNET_RPC_URL=https://…
export MAINNET_RPC_URL="https://…"

pnpm --filter cache fetch:tokens   # from the repo root
# or, from this directory:
pnpm fetch:tokens
```

> The script is named `fetch:tokens`, not `fetch`, because `pnpm fetch` is a
> built-in pnpm command (it populates the store from the lockfile) and would
> shadow the script.

The `@avante/*` packages must be built first (`pnpm build` at the repo root) — the
script imports their published entry points.

### What a run does

1. **Pins one block `B`** at the start and reads everything `at` `B` — one
   consistent chain snapshot, even if new tokens are minted mid-run.
2. Fetch list = on-chain `1..totalSupply` **minus** the tokens already *complete*
   on disk (**missing-only** — a re-run fetches nothing new). A token missing
   **any** of its required files is refetched whole — deterministic content and
   the canonical formatters make the rewrite byte-stable — so adding a file to
   the layout backfills the archive on the next run. Presence can't see
   *content*: on a file-**shape** change (e.g. a new embedded field), delete the
   affected files and re-run.
3. Per fetched token, writes `<id>.json` (the metadata, with the `image` and
   `animation_url` blobs extracted) and `<id>.svg` (the decoded SVG,
   **pretty-printed** with prettier for a readable, diff-friendly archive — its
   bytes therefore differ from the on-chain original, though it renders
   identically). For **`ec`-schema worlds** it also writes `<id>.html` (the
   decoded `animation_url` — the chain's own playable player around the same
   SVG, pretty-printed like the `.svg`), and the `.json` embeds a `chamber`
   field: the on-chain `Crawl.ChamberData` struct, read `at` `B` via
   `tokenIdToCoord(tokenId)` → `coordToChamberData(chapter, coord,
   generateMaps: true)` — the SVG alone does not carry the full map data the
   converter needs. (`chamber`, not `chamberData` — the view of that name has a
   different, converted shape.) Stamps the token `{ block: B, fetchedAt }`.
4. Advances `fetchedThroughBlock` to `B` on **every** clean run — even when nothing
   was fetched — so a future staleness scan starts from `B + 1`.

**Idempotent:** a second run against an unchanged chain fetches nothing; only the
watermark moves. **On error:** each on-chain read retries **3× with a 1 s wait**,
then the run aborts with a non-zero exit (nothing is left half-written beyond the
tokens already committed).

## `_cache.json` — provenance + state

One per `dataDir`. Self-describing (so the archive says where it came from),
byte-stable, and excluded from the token-contiguity check (leading `_`):

```json
{
  "name": "mainnet",
  "network": "ethereum",
  "chainId": 1,
  "contractName": "CrawlerToken",
  "contractAddress": "0x…",
  "fetchedThroughBlock": "21000000",
  "updatedAt": "2026-07-15T00:00:00.000Z",
  "tokens": { "1": { "block": "21000000", "fetchedAt": "2026-07-15T00:00:00.000Z" } }
}
```

The binding fields echo the source world; `fetchedThroughBlock` + the per-token
`block` are the provenance that a future **staleness / neighbour-invalidation** pass
will use (see `specs/SDK_PLAN.md` #16). No chamber is refetched for staleness today —
the invalidation policy is a schema-level concern in `crawler-core` and is currently
empty.

## Tests

```sh
pnpm --filter cache test          # also runs under the root `pnpm test` (recursive)
```

Invariants over the committed archive: every `.json` has its sibling files (`.svg`,
plus `.html` for `ec` worlds), token ids are contiguous from 1, no data-URI blob
survives in the JSON, every `ec` token JSON embeds its own `chamber` struct
(`tokenId` echo + generated `tilemap`), and `_cache.json`'s binding echo matches
the resolved world. A world listed but not yet fetched is skipped.

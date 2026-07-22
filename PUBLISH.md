# Publishing — data refresh & distribution build

How to cut a data release: refresh the on-chain token cache, rebuild the world
JSON from it, and build the packages for distribution. Publishing to npm is
**deliberately not covered yet** — that lands with the surface freeze at P10
(see `specs/SDK_PLAN.md`).

The pipeline is three decoupled stages (see `specs/SDK_SPECS.md` §Data
pipeline): **fetch** (the only on-chain stage) → **build worlds** (offline,
cache → JSON) → **build packages** (tsdown bundles whatever JSON is committed).

## 0. Prerequisites

- Node + pnpm are asdf-managed (`.tool-versions`); `pnpm install` once.
- An RPC endpoint for each cached world, in the env var named by
  `cache/worlds.json` (`rpcEnv` — mainnet: `MAINNET_RPC_URL`). A `.env` at the
  repo root (or in `cache/`) is auto-loaded. **Required** — the fetch aborts up
  front without it; there is no public-RPC fallback for the archive.
- A fresh package build — both scripts below import the built `@avante/*`
  entry points:

```sh
pnpm run build          # sequential — required build order
```

## 1. Fetch the cache (on-chain)

```sh
pnpm --filter cache fetch:tokens
```

Pins one block `B`, reads `totalSupply` at `B`, and fetches only the missing
token ids into `cache/data/<dataDir>/` (`<id>.json` with the embedded `chamber`
struct, `<id>.svg`, `<id>.html`), stamping each in `_cache.json`. Idempotent —
an unchanged chain fetches nothing and only advances the `fetchedThroughBlock`
watermark. Throttled ≤ 10 req/s (`CACHE_MAX_RPS`); a read that fails 3× aborts
the run cleanly (already-written tokens stay — just re-run).

After the missing-only pass, the **staleness pass** runs automatically: every
token fetched in the run invalidates its coordinate-schema neighbours
(`getInvalidatedCoords` — a new mint clears locks on cached *neighbour*
chambers), and the affected already-cached tokens are refetched whole at the
same block `B`, byte-stably. Manual invalidation still works the same way
whenever needed: delete a token's files (`<id>.json`/`.svg`/`.html`) and re-run.

## 2. Rebuild the worlds (offline)

```sh
pnpm --filter @avante/crawler-data run build:worlds
```

For each world in `cache/worlds.json`: converts every cached token through the
schema's converter, assembles the views (`worldInfo` re-stamped with the build
timestamp, `tokenCoord`, `chamberData`, `tokenSvg`), validates with
`loadWorld`, and rewrites `packages/crawler-data/src/worlds/<name>.json`
through the canonical serializer. No chain calls, no RPC needed. Deterministic:
rebuilding from the same cache is byte-identical modulo the timestamp. Goerli
is never rebuilt (frozen as migrated — dead chain).

## 3. Verify

Both the fetch and the builder are byte-stable, so **`git diff` is the
verification**: the world JSON should change only by the `timestamp`, the new
tokens' entries (`tokenCoord`/`chamberData`/`tokenSvg`), and any manually
invalidated chambers' evolved records. Anything else moving is a red flag.
Then the gates:

```sh
pnpm run build          # rebuild — the packages bundle the new JSON
pnpm run typecheck
pnpm run test           # cache invariants + converter↔world equivalence + world invariants
pnpm run lint
```

Commit the new `cache/data/**` files and the rebuilt world JSON together.

## 4. Build the packages for distribution

```sh
pnpm run clean && pnpm run build && pnpm run check:pack
```

`build` is sequential (downstream `.d.ts` bundling reads core's built types);
`check:pack` runs publint + arethetypeswrong over each package's packed output,
covering `crawler-data`'s multi-entry surface (root + `./mainnet` +
`./goerli`). Invariant worth spot-checking after surface changes: the root
entry (`dist/index.js`) must carry **no world JSON** — worlds ship only through
the per-world subpaths.

## 5. Publish to npm

Prerequisites: publish rights on the npm **`@avante`** scope (`npm login`), and
a clean working tree on `main` (pnpm's publish git checks enforce this).

1. **Gates** — everything must be green, from the repo root:

```sh
pnpm run clean && pnpm run build
pnpm run typecheck && pnpm run test && pnpm run lint
pnpm run check:pack        # publint + arethetypeswrong per package
pnpm run check:docs        # typedoc validation (undocumented export ⇒ red)
                           # + vocs build (broken Twoslash example ⇒ red)
```

2. **Version** — the four packages version in **lockstep**:

```sh
pnpm --filter '@avante/*' exec npm pkg set version=<x.y.z>
```

Commit the version bump (the publish reads the committed state).

3. **Dry run, then publish** — pnpm rewrites the `workspace:` protocol to real
version ranges on pack; the manifests carry `publishConfig.access: public`:

```sh
pnpm --filter '@avante/*' -r publish --dry-run
pnpm --filter '@avante/*' -r publish --tag alpha   # alpha status → alpha dist-tag
```

While the packages are alpha, publish under the `alpha` dist-tag; promote with
`npm dist-tag add @avante/<pkg>@<x.y.z> latest` when a release is stable.
Afterwards, tag the release commit (`git tag sdk-v<x.y.z>`) and push the tag.

Provenance attestation (`--provenance`) requires a CI OIDC environment — adopt
it when a CI workflow exists; local publishes skip it.

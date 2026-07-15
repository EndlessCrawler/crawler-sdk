# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Specs

- **`specs/V2_PLAN.md`** — the modernization plan (phases, decisions, gates). Consult it before starting any migration work; it is the plan of record. It mirrors the sibling repo's plan at `../ec-dapp/specs/V2_PLAN.md` — ec-dapp's Phase 9 depends on this repo publishing `@avante/crawler-core|data|react` to npm.
- **`specs/SDK_PLAN.md`** — the **SDK refactor** plan of record: reshapes the API (functional core + thin wrapper, schemas, lazy datasets, documented surface) *after* V2 lands but *before* the first npm publish. Driven by the **`/sdk-plan`** slash command (`.claude/commands/sdk-plan.md`), which collects and organizes the user's ideas into it. The plan owns only what is **in flux** (open decisions, leans, grounding, phases); anything settled lives in SDK_SPECS and is only *mentioned* in the plan via `→ SPECS` pointers — **single home per fact**, never restate settled specification in the plan. Do not start refactor implementation until the user says so.
- **`specs/SDK_REFACTOR.md`** — the refactor's **execution map**: grounds the current code file-by-file and states each piece's disposition (stays / adapted / replaced / deleted) plus the step order per phase. Holds no specification (SPECS wins on conflict) and no open decisions (the plan owns those) — only the mapping and sequencing. Covers the landed `crawler-core` port (P1–P2) and the maps for P3–P6 (api contract layer → EC cache → EC converter → builder + per-world exports), to be executed one at a time in that order.
- **`specs/SDK_SPECS.md`** — the **living final specification** and the **single home of every settled fact** (migrated from SDK_PLAN as decisions close; the plan only points here). **Specs ↔ code lockstep is mandatory:** every code change that touches specified behavior must update SDK_SPECS in the same change, and every spec change must be propagated into code — a change to one without the other is incomplete.
- **`specs/CODING_STYLE.md`** — formatting, TypeScript, library-design, and testing rules. **All code written in this repo must follow it**, including during the modernization.

## Overview

Endless Crawler SDK — a pnpm monorepo of TypeScript packages for interacting with the on-chain generative dungeon game [Endless Crawler](https://endlesscrawler.io/) (and its sibling game Loot Underworld). The SDK models dungeon chamber coordinates, caches map data off-chain, and exposes a web3 API and React bindings.

Status per package (from README): `crawler-core`/`crawler-data`/`crawler-react`/`crawler-api` are **alpha**, contracts are **planned**. Things break; APIs are unstable.

Requires **Node 24.18.0** and **pnpm 10.30.1** — both asdf-managed via `.tool-versions` (+ root `engines`/`packageManager`). Everything is ESM (`"type": "module"`). Internal `@avante/*` deps use the `workspace:` protocol; all common external versions live in the **pnpm catalog** (`pnpm-workspace.yaml` `catalog:`) and manifests reference them as `catalog:`.

## Commands

```sh
pnpm install                 # bootstrap the monorepo
pnpm run build               # tsdown-build all @avante/* packages SEQUENTIALLY (required — see below)
pnpm run typecheck           # tsc --noEmit across all packages (type-check gate; tsdown does the emit)
pnpm run test                # run all tests (packages + apps)
pnpm run clean               # rimraf dist everywhere
pnpm run check:pack          # publint + arethetypeswrong (esm-only) over each package's packed output

pnpm run lint                # Biome lint (whole workspace); lint:fix applies safe fixes
pnpm run format              # Biome format --write; format:check for CI-style no-write

# per-package shortcuts: replace <pkg> with core | data | api | react
pnpm run build:<pkg>
pnpm run test:<pkg>
pnpm run watch:test:<pkg>

# filter directly
pnpm --filter "@avante/crawler-core" test
pnpm --filter "@avante/crawler-core" test -- coord.luw   # run a single test file by name pattern
```

**Build system (V2 Phase 2):** each package is bundled by **tsdown** (rolldown + oxc) via its `tsdown.config.ts` into a single `dist/index.js` + `dist/index.d.ts` (ESM; `type: module` so plain `.js`, not `.mjs`). `tsc` is **type-check only** (`typecheck` script, `noEmit`) — it never emits. `tsconfig.base.json` is the single source of compiler truth (`moduleResolution: bundler`, `isolatedModules`, `strict`, `target ES2022`); each package's `tsconfig.json` just `extends` it with `include: ["src"]`. Package manifests carry `exports` maps + `files: ["dist"]` + `sideEffects: false` + `publishConfig.access`; every package has a single root entry (`crawler-core`'s old `./internal` importer subpath died with the global store in the SDK-refactor P2). Packaging is gated by `pnpm check:pack` (publint + arethetypeswrong, esm-only profile).

Build order matters: `pnpm run build` uses `--sequential` because packages depend on `@avante/crawler-core` at build time (downstream `.d.ts` bundling reads core's built types). Prefer it over `build:all` (`-r`, unordered) when a fresh build must succeed.

**Tests: Vitest (V2 Phase 3).** Each package has a `vitest.config.ts` (`test.include: ['test/**/*.test.ts']`, node environment); `test` runs `vitest run`, `watch:test` runs `vitest` (watch mode). ESM-native — no Node flags, no ts-jest, no `.npmrc` hoist patterns (all removed with Jest). Tests import `describe`/`it`/`expect`/`beforeAll` explicitly from `vitest` (no globals, per `specs/CODING_STYLE.md`); custom failure messages use Vitest's native `expect(actual, 'message')`. Cross-package imports resolve to **source** via `resolve.alias` in the config (so tests run without a prior build); the bare `@avante/*` aliases are anchored (`/^@avante\/crawler-core$/`). Run tests through the pnpm scripts.

**Biome** (root `biome.jsonc`) is the formatter **and** linter — 2-space, single quotes, semicolons (per `specs/CODING_STYLE.md`). The whole repo was formatted in the V2 Phase 1 sweep. `pnpm lint` passes with **0 errors**; the crawler-api `any`/`@ts-ignore` downgrades died with the P3 contract-layer refactor (`noExplicitAny`, `useIterableCallbackReturn`, `noTsIgnore` are back at error; the whole `@avante/*` surface is `any`-free). Generated data (`crawler-data/src/worlds`, `crawler-api/src/artifacts` + the codegen output `**/src/generated/**`) is excluded, as is the Tailwind entry CSS (`apps/sdk-explorer/styles/main.css` — its directives break Biome's CSS parser).

**`apps/sdk-explorer`** (V2 Phase 7) is a **Next 16 App Router** app on the ec-dapp stack: React 19, wagmi 2 + ConnectKit 1.9 + `@tanstack/react-query`, **Tailwind v4** (no config file — `@theme` tokens live in `styles/main.css`, wired via `postcss.config.mjs`), Biome (no ESLint). It's a read-only SDK demo: `src/app/providers.tsx` (`'use client'`) nests `WagmiProvider > QueryClientProvider > ConnectKitProvider > CrawlerProvider > WorldProvider > SelectionProvider` (browsed-world UI state from `src/hooks/WorldContext.tsx`, Results-panel state from `src/hooks/SelectionContext.tsx`); the `api/read` route handler reads on-chain via `crawler-api`'s typed P3 surface (world binding from `crawler-data`, per-call `rpcUrl` from `src/lib/serverRpc.ts` — there is no global RPC registry). The old `api/view` route died with the api view machinery (P2); the converted on-chain routes are rebuilt at P7 on the P3 contract surface. The ConnectKit/React-19 peer warnings are expected (match ec-dapp). To develop it against live package changes: run `pnpm run watch` in one terminal and `cd apps/sdk-explorer && pnpm dev` (Next dev on `--webpack`) in another.

## Architecture

### Packages (`packages/*`, workspace-linked as `@avante/*`)

The architecture follows **`specs/SDK_SPECS.md`** (the authoritative specification — this is only the orientation map). Rewritten in the SDK refactor's P1–P3 (see `specs/SDK_REFACTOR.md`).

- **crawler-core** — zero runtime deps, Node-compatible; the heart of the SDK. Modules: `bigintish/` (the `BigIntish` type + all bigint handling), `schema/` (`DataSchema` descriptors: `ec`, `cnc`; derived types), `chamber/` (`ChamberData<Schema>`, `Door`, tile/terrain/gem vocabulary, the tilemap library), `coords/` (coordinate-schema registry; the NEWS library), `world/` (`World`/`WorldJson` types, `loadWorld` validation, pure per-view reads, pure merge, the `Converter` interface), `client/` (`createCrawler`, the `Crawler` container + `WorldHandle` + `Chamber`), `errors.ts`.
- **crawler-data** — static worlds in the settled World shape (`src/worlds/mainnet.json`, `goerli.json`), exported as `WorldJson` values (`mainnetWorld`, `goerliWorld`, `allWorlds` — interim root exports; per-world subpaths land at P6). `scripts/migrateWorlds.ts` is the one-off P2 migration that produced them (kept: its derivations seed the P5 converter). Goerli is **frozen as migrated** (dead chain).
- **crawler-api** — the on-chain contract layer, **viem 2 only** (rewritten in the SDK-refactor P3). Committed artifact JSON (`src/artifacts/`, 8 live contracts) is codegen'd by the package's `gen` script into the git-ignored `src/generated/abis.ts` (const-asserted ABIs + the `contractAbis` registry; `gen` runs before every build/typecheck/test). Surface: `getWorldContract(world, { rpcUrl })` (fully-typed viem instance from the world binding), `getCardsContract`/`getErc20`/`getErc721`/`getTypedContract`, the parsed-result helpers `readTotalSupply`/`readOwnerOf`/`readTokenMetadata` (tokenURI data-URI unpacked into `{ metadata, svg }`), `getPublicClient` (cached; no `rpcUrl` → viem's default public RPC + `console.warn`). `BigIntish` addresses/chain ids at every boundary. Also home of **`formatViewData`**, the canonical dataset serializer (must stay in this package — SPECS §Canonical serialization).
- **crawler-react** — `CrawlerProvider` (holds an explicit `Crawler`) + hooks (`useCrawler`, `useWorld`, `useChamber`, `useWorldNames`). Keep-lights-on P2 shape; simplified/extended at P8 (live path).

### The `Crawler` client (core)

`createCrawler(worlds)` (`client/crawler.ts`) is the entry point — sync, explicit, isolated (no global anything). It takes `WorldJson` values (or `{ world, converter }` bundles from `crawler-data`), validates each through `loadWorld`, and returns a **`Crawler`** container: `crawler.worlds()` → names, `crawler.world(name)` → a stable **`WorldHandle`** whose method-style reads delegate to the pure functions in `world/reads.ts`. `chamber.world` back-points to its handle; `world.coords` exposes the schema's coordinate library; `world.import(tokenId, payload)` converts + **pure-merges** into a *new* immutable `World` value and fires the `Crawler`'s single coarse, typed **"world updated" subscription** (the only reactivity primitive — no DOM events).

### Schemas, Worlds, Views

The variation axis is the **schema** (`'ec'` today; `'cnc'` planned) — a runtime descriptor (`schema/schema.ec.ts`, `as const satisfies DataSchema`) from which the types derive. A **World** is a plain, serializable, immutable value bound to an ERC-721 contract (`{ name, network, chainId, contractAddress, contractName, schema, views }`); its **views** are typed keyed maps (`worldInfo` singleton, `tokenCoord`, `chamberData`, `tokenSvg`), optional per world — absent view reads throw `MissingViewError` (`hasView` is the capability query), record misses return `undefined`. Stored JSON uses decimal-string keys and readable string values; in memory everything chain-scale is `bigint` (normalized by `loadWorld`). `ChamberData` mirrors the on-chain Solidity struct from `Crawl.sol` (doc comment in `chamber/chamber.ts`); games navigate by `Door.destCoord`/`destTile`, never offset math.

### Coordinates: Compass ↔ Coord ↔ Slug

Coordinate math lives in per-coordinate-schema **libraries** resolved by name (`coords/registry.ts`), reached through the world (`world.coords`) — not on the standard client surface. **NEWS** (`coords/news.ts`) owns `Dir`, the packed-`uint256` bit math (`CoordMax`/`CoordOffset`/`CoordMask`, NEWS order, 64 bits per direction), and the Compass ↔ Coord ↔ Slug conversions; its bit-level semantics mirror `Crawl.sol` and are **frozen** — the `coord.ec`/`compass.ec`/`slug.ec` suites pin exact packed bigints. `chamber-id` is the interim no-native-coords schema (`cnc`, plan #14).

## Conventions

- Coding style (formatting, TS, library design, testing): see **`specs/CODING_STYLE.md`**. Formatting is **Biome, 2-space, single quotes, semicolons** (root `biome.jsonc` + `.vscode/settings.json`) — the whole repo was swept in V2 Phase 1; format on touch.
- Internal cross-module helpers are prefixed `__` and are not part of the public API (none currently exist — the convention stands, per `specs/CODING_STYLE.md`).
- Each package has a `tsconfig.json` (`extends tsconfig.base.json`, `include: ["src"]`) used by `tsc --noEmit`; **tsdown** (`tsdown.config.ts`) does the actual build. The root `tsconfig.json` is VSCode-only. `tsconfig.base.json` maps `@avante/*` → `packages/*/src` so type-checking and go-to-source resolve to source.
- Internal `@avante/*` deps use the workspace protocol (`workspace:^` for the published peer range, `workspace:*` for dev/app deps); shared external versions come from the `catalog:` (`pnpm-workspace.yaml`). The catalog is on **React 19** / **`@types/node` 24** (V2 Phase 4); TS stays on the **5.x** line (`^5.9.3`; `@types/node` tracks the Node 24 engine, not the latest — both are documented `pnpm outdated` exceptions).
- **`crawler-react` peers `react: ^18 || ^19`** (inline range, not `catalog:` — a range can't come from a single-version catalog entry) so both React majors resolve; ec-dapp (the primary consumer) is React 19. The explorer is now on React 19 too (Phase 7); its only residual peer warnings come from ConnectKit 1.9 wanting React 17/18 — expected and harmless (ec-dapp ships the same).

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Specs

- **`specs/V2_PLAN.md`** — the modernization plan (phases, decisions, gates). Consult it before starting any migration work; it is the plan of record. It mirrors the sibling repo's plan at `../ec-dapp/specs/V2_PLAN.md` — ec-dapp's Phase 9 depends on this repo publishing `@avante/crawler-core|data|react` to npm.
- **`specs/CODING_STYLE.md`** — formatting, TypeScript, library-design, and testing rules. **All code written in this repo must follow it**, including during the modernization.

## Overview

Endless Crawler SDK — a pnpm monorepo of TypeScript packages for interacting with the on-chain generative dungeon game [Endless Crawler](https://endlesscrawler.io/) (and its sibling game Loot Underworld). The SDK models dungeon chamber coordinates, caches map data off-chain, and exposes a web3 API and React bindings.

Status per package (from README): `crawler-core`/`crawler-data`/`crawler-react` are **alpha**, `crawler-api` is **broken**, contracts are **planned**. Things break; APIs are unstable.

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

**Build system (V2 Phase 2):** each package is bundled by **tsdown** (rolldown + oxc) via its `tsdown.config.ts` into a single `dist/index.js` + `dist/index.d.ts` (ESM; `type: module` so plain `.js`, not `.mjs`). `tsc` is **type-check only** (`typecheck` script, `noEmit`) — it never emits. `tsconfig.base.json` is the single source of compiler truth (`moduleResolution: bundler`, `isolatedModules`, `strict`, `target ES2022`); each package's `tsconfig.json` just `extends` it with `include: ["src"]`. Package manifests carry `exports` maps + `files: ["dist"]` + `sideEffects: false` + `publishConfig.access`; **crawler-core also exports `./internal`** (a second tsdown entry from `src/modules/importer.ts`) for the `__`-prefixed dataset-importer plumbing that crawler-data uses, kept off the public root. Packaging is gated by `pnpm check:pack` (publint + arethetypeswrong, esm-only profile).

Build order matters: `pnpm run build` uses `--sequential` because packages depend on `@avante/crawler-core` at build time (downstream `.d.ts` bundling reads core's built types). Prefer it over `build:all` (`-r`, unordered) when a fresh build must succeed.

Tests use Jest + ts-jest in ESM mode; the `test` script sets `NODE_OPTIONS=--experimental-vm-modules` (`.npmrc` hoists `*jest*` + `@types*` so ts-jest resolves types under pnpm's isolated layout). Run tests through the pnpm scripts, not bare `jest`, or ESM will not load. (V2 Phase 3 replaces this whole stack with Vitest.)

**Biome** (root `biome.jsonc`) is the formatter **and** linter — 2-space, single quotes, semicolons (per `specs/CODING_STYLE.md`). The whole repo was formatted in the V2 Phase 1 sweep. `pnpm lint` passes with **0 errors**; the remaining warnings are tracked migration debt (legacy `==`/`any`, the sdk-explorer's pre-rewrite a11y/switch nits, etc.), each downgraded with a justifying comment in `biome.jsonc` and re-tightened in the phase that rewrites that code. Generated JSON (`crawler-data/src/data`, `crawler-api/src/contracts`) is excluded.

To develop `apps/sdk-explorer` (Next.js) against live package changes: run `pnpm run watch` in one terminal and `cd apps/sdk-explorer && npm run dev` in another.

## Architecture

### Packages (`packages/*`, workspace-linked as `@avante/*`)

- **crawler-core** — no runtime deps; the heart of the SDK. Contains types, the module system, the view/dataset system, coordinate math (`crawler/`), and utils.
- **crawler-data** — static cached map data as JSON (`data/mainnet`, `data/goerli`), exported as ready-to-use `DataSet` objects (`mainnetDataSet`, `goerliDataSet`, `allDataSets`).
- **crawler-api** — on-chain web3 layer (wagmi + viem) plus contract ABIs in `contracts/` and `artifacts/`. Marked broken.
- **crawler-react** — a `CrawlerProvider` context + hooks (`useCrawler`/`useEndlessCrawler`/`useLootUnderworld`, `useChamberData`, `useSideCoords`, `useDataSets`).

### Module system (core)

`createClient()` (`modules/client.ts`) is the entry point. It accepts either a `ModuleId` or an array of `DataSet`s and returns a module instance — `EndlessCrawler.Module` or `LootUnderworld.Module`. Each game is a **TypeScript namespace** (`module.ec.ts`, `module.luw.ts`) whose `Module` class extends `ModuleBase` and implements `ModuleInterface` (`modules/modules.ts`). The two `ModuleId`s are `'ec'` and `'luw'`. Mixing datasets from different modules in one client throws `MixedModulesError`.

`ModuleBase` provides generic Compass/DataSet/View plumbing; each module supplies the abstract, game-specific coordinate methods.

### Coordinates: Compass ↔ Coord ↔ Slug

A chamber location has three representations, converted by module methods:
- **Compass** — an object of named directions (`{ north, east, west, south, yonder, ... }`). Endless Crawler packs North/East/West/South into a `uint256`; Loot Underworld adds `over`/`under`/`domainId`.
- **Coord** — the packed `uint256` as a JS `bigint` (directions in NEWS order, 64 bits each).
- **Slug** — a human-readable string form.

When touching coordinate logic, mind that these are **bigint** and game-specific; EndlessCrawler and LootUnderworld pack them differently.

### DataSets, Views, and the global namespace

A `DataSet` is `{ moduleId, dataSetName, chainId, views }`. A **View** (`views/view.ts`) is `{ metadata, records }`; the two view names are `chamberData` and `tokenIdToCoord`. Each view is wrapped by a `ViewAccess` class (e.g. `ChamberDataViewAccess`) that exposes `.get()`/`.set()` and converts between an input **Model** (e.g. `ChamberDataModel`) and stored records.

**Important, non-obvious:** imported DataSets live in a **global singleton** — `window.CrawlerModules` (browser) or `global.CrawlerModules` (Node), keyed by `moduleId`, managed by `modules/importer.ts` (the `__`-prefixed functions). Modules don't hold their own dataset state; they read/write this global. There is a "current" dataset per module (`setCurrentDataSet` / `getCurrentDataSetName`). Consequences: importing data mutates process-global state, multiple clients of the same module share it, and tests can leak state between each other.

Dataset/view operations emit events (`modules/events.ts`, `EventName`), which the React hooks subscribe to.

### Chains

Supported chains live in `views/chains.ts`: `ChainId` (Blank=0, Mainnet=1, Goerli=5) ↔ `NetworkName`. `ChamberData` mirrors the on-chain Solidity struct from `Crawl.sol` (documented inline in `views/view.chamberData.ts`).

## Conventions

- Coding style (formatting, TS, library design, testing): see **`specs/CODING_STYLE.md`**. Formatting is **Biome, 2-space, single quotes, semicolons** (root `biome.jsonc` + `.vscode/settings.json`) — the whole repo was swept in V2 Phase 1; format on touch.
- Internal cross-module helpers are prefixed `__` (e.g. `__importDataSets`) and generally not part of the public API.
- Each package has a `tsconfig.json` (`extends tsconfig.base.json`, `include: ["src"]`) used by `tsc --noEmit`; **tsdown** (`tsdown.config.ts`) does the actual build. The root `tsconfig.json` is VSCode-only. `tsconfig.base.json` maps `@avante/*` → `packages/*/src` so type-checking and go-to-source resolve to source.
- Internal `@avante/*` deps use the workspace protocol (`workspace:^` for the published peer range, `workspace:*` for dev/app deps); shared external versions come from the `catalog:` (`pnpm-workspace.yaml`).

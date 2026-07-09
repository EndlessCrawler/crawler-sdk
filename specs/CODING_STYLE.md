# Coding Style

Rules for all code written in this repo. Referenced from `CLAUDE.md`; followed during the modernization (`specs/V2_PLAN.md`) and for all new code. Kept deliberately in sync with `../ec-dapp/specs/CODING_STYLE.md` — the two sibling repos share one toolchain and one style.

## Formatting

- **Biome** is the formatter and linter.
- **One root `biome.jsonc` for the whole workspace** — every package and app (current and future) uses it. No per-package Biome configs or overrides. `.vscode/settings.json` sets Biome as the default formatter, mirroring the root config.
- **2-space indentation**, single quotes, semicolons.
- Legacy files still use tabs until the repo-wide format sweep lands (V2 plan, Phase 1); any file touched before then gets formatted on touch.
- Rule downgrades in `biome.jsonc` always carry an inline comment saying why (tracked debt, false positive, intentional idiom) — never silently disable a rule.
- Match the surrounding code's idiom: comment density, naming, structure.

## TypeScript

- **`strict` is on and stays on.** Don't add `any` where a real type is cheap; pragmatic `any`s are tracked debt.
- **Domain types are hand-written, never `any`**: `Compass` shapes, `Coord` (`bigint`), `Slug`, `ChamberData`, the View/DataSet shapes. They mirror on-chain structs — treat their bit-level semantics as frozen.
- **Native `bigint` for all chain-scale integers** — no `bn.js`, no `BigNumber`, no lossy `number` for coords/token ids/uint256 values.
- **ESM only** (`"type": "module"` everywhere). Once Phase 2's NodeNext migration lands, relative imports in the packages carry explicit `.js` extensions.
- Cross-package imports use the package name (`@avante/crawler-core`), never relative paths across package boundaries. Inside a package, relative imports are fine.
- Public API is what a package's `index.ts` (and later its `exports` map) re-exports. Internal cross-module helpers are prefixed `__` (e.g. `__importDataSets`) and are not public API — don't export them from the package root.

## Library design

- **`crawler-core` has zero runtime dependencies.** Keep it that way; `crawler-data` too (data + core peer only).
- **Prefer native platform resources over wrapper libraries** — `JSON.stringify(x, null, 2)` over a pretty-printer dep, `fetch` over HTTP libs, Node/DOM built-ins over shims. A new runtime dependency in any package needs a reason the platform can't cover.
- React is a **peer dependency** of `crawler-react` (`^18 || ^19`) — never a direct dependency; no React imports outside that package.
- Game-specific logic lives in the module namespaces (`EndlessCrawler` / `LootUnderworld`, extending `ModuleBase`); generic plumbing (views, datasets, events, importer) stays game-agnostic in `modules/`/`views/`.
- Dataset/view mutations emit events (`modules/events.ts`) — new state-changing operations must emit, since the React hooks subscribe to them.

## Testing

- **Vitest** (after V2 Phase 3; Jest until then). Tests live in each package's `test/` directory as `*.test.ts`.
- Import `describe`/`it`/`expect` explicitly from `vitest` — no globals.
- Use `expect(actual, 'message')` for the custom failure messages (replaces `jest-expect-message`).
- **Coordinate/bit math is pinned**: the `crawler-core` compass/coord/slug suites assert exact packed `bigint` values. Any change to coordinate logic must keep those pins green or change them with an explicit on-chain-compatibility justification.
- Remember the **global singleton** (`CrawlerModules`): dataset-importing tests share process state — reset or isolate when adding tests that import datasets.

## Monorepo conventions

- **pnpm workspace**; internal `@avante/*` deps use the **`workspace:*`** protocol; shared external dev-dependency versions live in the **pnpm catalog** (`pnpm-workspace.yaml`).
- One lockfile at the root; one Biome config; one `tsconfig.base.json` that package `tsconfig.build.json`s extend. The root `tsconfig.json` is VS Code-only.
- Run tests/builds through the pnpm scripts (`pnpm run build`, `pnpm run test:<pkg>`), not bare tools — build order matters (`--sequential`).
- Node and pnpm versions are pinned (`.nvmrc` / `.tool-versions` / `packageManager`); don't rely on globals.

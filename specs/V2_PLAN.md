# crawler-sdk — Modernization Plan

A phased plan to bring the Endless Crawler SDK monorepo up to a modern stack, adapted from the sibling `ec-dapp` modernization (`../ec-dapp/specs/V2_PLAN.md`). The scope here is smaller — the repo is already TypeScript, ESM, and a pnpm workspace — so this plan is about **tooling, dependency currency, packaging correctness, and publishing**, not a framework/UI migration. Each phase keeps the repo building and tests green so phases can ship independently.

**Baseline today (2026-07-08):** pnpm monorepo of 4 TS packages (`@avante/crawler-core|data|api|react`) + 1 Next.js 14 app (`apps/sdk-explorer`). Node 18 / pnpm 8 engines; TypeScript 5.3; Jest 29 + ts-jest in ESM mode (`NODE_OPTIONS=--experimental-vm-modules` + an `.npmrc` jest hoist pattern); tsc builds with bare `main`/`types` fields (no `exports` maps); tabs, no formatter/linter; a `.code-workspace` file instead of `.vscode/`. `crawler-api` is **broken** on viem 1 + `@wagmi/core` 1 (its `configureChains`/provider API no longer exists). `crawler-react` peers on React `^18`. The explorer runs Next 14 Pages Router + semantic-ui-react + sass + wagmi 1. **Install is currently broken:** package.jsons reference the `catalog:` protocol but no catalog is defined in `pnpm-workspace.yaml`, and the lockfile predates those refs (no `catalog` or `workspace:` entries).

**Strategic driver:** `ec-dapp` V2 Phase 9 waits on `@avante/crawler-core`/`-data`/`-react` being **published to npm** (with the same libs and data as `@rsodre/crawler-data`). Getting those three packages modern, correct, and published is the critical path; `crawler-api` and the explorer come after.

**Decisions:**
- **Mirror the ec-dapp toolchain** so the two sibling repos feel identical: Node **24.18.0** (latest 24.x LTS, installed via **asdf**) pinned via `.tool-versions` + `engines`; **pnpm 10.30.1** (10.x confirmed; asdf-managed) pinned via `packageManager` + `.tool-versions`; **Biome** (root `biome.jsonc`, 2-space, single quotes, semicolons) as formatter + linter; `.vscode/settings.json` + `extensions.json` replace the `.code-workspace`.
- **pnpm workspace stays**, fixed: internal cross-package deps use the **workspace protocol** (`workspace:^` for published peers → publishes as `^0.1.0`; `workspace:*` for dev/app deps); **all common (multi-package) external versions live in the pnpm catalog** in `pnpm-workspace.yaml` and manifests reference them via `catalog:` — single-package deps stay inline.
- All formatting/style rules live in **`specs/CODING_STYLE.md`** and apply to every phase.
- **Jest → Vitest**: ESM-native, kills the `--experimental-vm-modules` hack, `ts-jest`, `jest-expect-message` (Vitest's chai `expect(actual, message)` covers the custom messages), and the `.npmrc` hoist patterns.
- **TypeScript stays on the 5.x line** for this modernization (bump to the latest 5.x; decided 2026-07-08) — TS 7 (the native compiler, `7.0.2` at planning time) is revisited after the modernization lands.
- **Published-library packaging done right** (decided 2026-07-08): `exports` maps + `files: ["dist"]` + `sideEffects: false`; `module`/`moduleResolution` **NodeNext** for the packages with explicit `.js` extensions on relative imports (mechanical sweep) so built output is valid ESM for both Node and bundler consumers; plain tsc stays the builder; validated with **publint** + **arethetypeswrong**.
- **`crawler-api` goes viem-only** (viem 2): the `@wagmi/core` 1 provider/`configureChains` API it uses is gone, and a viem-only core avoids coupling the SDK to a wagmi major (ec-dapp is on wagmi 2; wagmi 3 is current). Wagmi integration stays in the consumer (or `crawler-react` later).
- **`crawler-react` peers on `react: ^18 || ^19`** — ec-dapp (the primary consumer) is React 19.
- **Prune deps aggressively; prefer native platform resources** — e.g. `prettier` is a *runtime* dep of `crawler-api` only to pretty-print JSON (`formatter.ts`); replace with `JSON.stringify(data, null, 2)` and drop it.
- **Native `bigint` everywhere** — already the case in `crawler-core`; keep it that way.
- The **goerli dataset stays** in `crawler-data` (historical cached map data; the chain being dead doesn't invalidate the cache). `ChainId` keeps its current values.
- **CLAUDE.md is updated at the end of every phase** to reflect the new stack, commands, and architecture.

**Version facts (verified via npm, 2026-07-08):** typescript `7.0.2` (latest; `6.0.0-beta` bridge), vitest `4.1.10`, jest `30.4.2`, @biomejs/biome `2.5.3` (ec-dapp pins `2.5.2`), viem `2.55.0`, @wagmi/core `3.6.1` / wagmi `3.7.1`, react `19.2.7`, next `16.2.10`, pnpm `11.10.0` (latest) / `10.28.2` (ec-dapp pin), rimraf `6.1.3`, connectkit `1.9.2` (caps wagmi at 2.x).

## Dependency end-state

| Removed | Replaced by |
|---|---|
| `jest`, `ts-jest`, `jest-expect-message`, `@types/jest` | `vitest` (ESM-native; `expect(actual, message)`) |
| `.npmrc` `public-hoist-pattern[]=*jest*` | nothing (obsolete with Vitest) |
| `prettier` (runtime dep of `crawler-api`) | `JSON.stringify(data, null, 2)` |
| `@wagmi/core` 1 (in `crawler-api`) | `viem` 2 only |
| `catalog:` refs without a catalog | `workspace:*` (internal) + a real pnpm catalog (shared externals) |
| `crawler-sdk.code-workspace` | `.vscode/settings.json` + `extensions.json` |
| explorer: `semantic-ui-react`, `semantic-ui-css`, `sass`, `react-cookie`, `eslint` + `eslint-config-next` | Tailwind CSS / native platform / Biome (Phase 7, mirroring ec-dapp) |

Kept: `rimraf` (bump to 6), tsc as the package build tool (unless Phase 2 picks `tsdown`), `@monaco-editor/react` (explorer).
Added: `@biomejs/biome`, `vitest`, `publint` + `@arethetypeswrong/cli` (CI-style pack checks).

---

## Phase 0 — Baseline & safety net ✅ (2026-07-08)

**Goal:** a known-good starting point: clean install, sequential build, and green tests on the current stack before anything moves.

> **Done (2026-07-08)** — executed together with Phase 1 steps 1–4 (the toolchain jump landed first, so the baseline was established directly on Node 24 + pnpm 10). Results:
> - **Install fixed**: internal `@avante/*` deps → `workspace:^` (peers) / `workspace:*` (dev/app); all multi-package externals → `catalog:` entries in `pnpm-workspace.yaml`; lockfile regenerated. `pnpm install` + `pnpm run build` (sequential) green.
> - **Tests**: `crawler-core` 8 suites / 20 tests passed (3 luw suites intentionally skipped), `crawler-data` 4 suites / 10 tests passed, `crawler-react` 1 skipped (placeholder). Fixed one stale test on touch: `bitmap.test.ts` imported `binaryArrayToBigInt` flat from the root barrel, but the export moved into the `Utils` namespace — test updated, bit-math pin intact.
> - **`crawler-api`**: compiles and runs 8 tests, **4 fail** — the README's known "broken" state: `InvalidModuleError` dataset wiring in the erc721 read calls + a views-contract-address validation failure. Phase 6 scope.
> - **`.npmrc`**: added `public-hoist-pattern[]=@types*` (alongside the existing `*jest*`) — under pnpm 10's isolated layout ts-jest's fallback tsconfig discovery couldn't see `@types/node` (`Cannot find name 'process'`). Both hoist patterns die with Jest in Phase 3.
> - **Explorer does not build** (recorded, deferred to Phase 7): after pinning `connectkit` to `~1.6.0` (the old lockfile's resolution; the fresh resolve floated `^1.5.2` → 1.9.2, which needs wagmi 2), the remaining failure is the explorer's own code being stale against the current core API (e.g. `client.tokenIdToCoord.get(1)` type error in `pages/data.tsx`).

**Exit criteria:** `pnpm install` + `pnpm run build` + `pnpm run test` green from a clean checkout (met, minus crawler-api's pre-existing failures); lockfile committed; baseline notes recorded.

---

## Phase 1 — Tooling foundation: Node/pnpm pins, Biome, editor config, format sweep ✅ (2026-07-08)

**Goal:** the repo's tooling matches ec-dapp — pinned modern Node/pnpm, one Biome config, `.vscode/` instead of the workspace file, and the whole repo formatted 2-space.

The format sweep must be its own commit (whitespace-only; `git blame -w` sees through it), separate from config/content changes.

**Steps**
1. **Node + pnpm pins:** ✅ (2026-07-08) `.tool-versions` → `nodejs 24.18.0` + `pnpm 10.30.1` (both asdf-installed); root `engines` → `"node": ">=24.18.0 <25.0.0"` (pnpm entry dropped); `packageManager: "pnpm@10.30.1"`. Stale `engines` removed from `apps/sdk-explorer/package.json` (also renamed `explorer2` → `sdk-explorer`, matching the README's filter examples).
2. **Root `package.json` cleanup:** ✅ (2026-07-08) `"private": true`, `@biomejs/biome 2.5.3` devDependency, `lint` / `lint:fix` / `format` / `format:check` scripts added; build/test/watch proxy scripts kept.
3. **Workspace hygiene:** ✅ (2026-07-08) `catalog:` section defined in `pnpm-workspace.yaml` — all multi-package externals (typescript, @types/*, the jest stack, rimraf, react/react-dom, viem) referenced via the catalog protocol from every manifest.
4. `.vscode/settings.json` + `.vscode/extensions.json` (Biome as default formatter, 2-space, excludes) replace `crawler-sdk.code-workspace` — delete the workspace file. Root `biome.jsonc` per `specs/CODING_STYLE.md`. ✅ (2026-07-08)
5. **Run the repo-wide Biome format sweep** ✅ (2026-07-08) — `biome format --write` reformatted 187 files. **Not purely whitespace** (Biome also normalizes quotes/semicolons/trailing-commas and reflows to 100 cols), so it's a *formatting-only* commit rather than whitespace-only — kept isolated from config/content changes so `git blame` archaeology stays easy. One formatting-induced breakage fixed on touch: the `BigInt.prototype.toJSON` polyfill in 5 `crawler-core` test files relied on a single `//@ts-ignore` above a one-line body suppressing *both* its errors (`toJSON` missing on `BigInt` + the `<=` type mismatch); Biome's multiline expansion split them, so each now carries a `//@ts-ignore` on both the assignment and the `return` (format-stable). **⏸ commit checkpoint: the sweep (+ this test fix) is its own formatting commit — the user commits.**
6. **Tune lint rule levels** ✅ (2026-07-08) — `biome lint` surfaced 86 errors across 27 rules; all were legacy idioms (`==`, `any`, `@ts-ignore`), intentional API patterns (the empty `ViewAccess` marker interface), benign soon-deleted jest-config dups, or sdk-explorer/crawler-api code slated for rewrite — **no real bugs**. Downgraded each to `warn` in `biome.jsonc` with a phase-tagged justifying comment (never silently off); each re-tightens in the phase that rewrites that code. Also excluded generated JSON (`crawler-data/src/data`, `crawler-api/src/contracts`, `**/artifacts`). Result: **`pnpm lint` exits 0** (0 errors; 373 warnings + 17 infos = tracked debt).
7. **Docs** ✅ (2026-07-08) — `CLAUDE.md` (pins, catalog/workspace protocol, Biome commands + the 0-errors/tracked-warnings note, sweep landed) and `README.md` (asdf-based setup, Biome) updated.

**Watch out for:** pnpm 10's stricter defaults vs pnpm 8 — build scripts of transitive deps are no longer auto-run (`pnpm.onlyBuiltDependencies` opt-in if anything needs it); the lockfile format changes (expected, commit it). *(Observed: pnpm 10 refuses to remove `node_modules` non-interactively — set `CI=true` for reinstalls that change hoisting.)*

**Exit criteria:** clean install/build/test on Node 24 + pnpm 10; repo is Biome-formatted and `pnpm lint` passes (0 errors; warnings only as commented tracked debt); `.code-workspace` gone; sweep is a separate commit.

---

## Phase 2 — TypeScript & packaging modernization

**Goal:** latest TypeScript, a modern shared tsconfig, and **correct published-ESM packaging** for all four packages — the prerequisite for publishing (Phase 5).

**Steps**
1. **TypeScript → latest 5.x** across the workspace via the catalog (decided 2026-07-08: stay on 5.x; TS 7 revisited post-modernization).
2. **Modernize `tsconfig.base.json`:** `target: ES2022`, `lib: ["ES2022", "DOM"]`, `module`/`moduleResolution: NodeNext` for the packages, `isolatedModules: true`, `verbatimModuleSyntax: true`; keep `strict`, `declaration`, `composite`/references. The explorer app keeps `moduleResolution: bundler` in its own tsconfig.
3. **`.js` extension sweep:** NodeNext requires explicit extensions on relative imports in the packages — mechanical codemod, verified by the build. *(Decided 2026-07-08: NodeNext + extensions over `tsdown` bundling — no new tooling, tsc stays the builder.)*
4. **Package manifests:** add to each package an `exports` map (`"." → { "types": "./dist/index.d.ts", "import": "./dist/index.js" }`), `files: ["dist"]`, `sideEffects: false`; drop the misleading `main`-only setup; rename the `publish` script (shadows the npm lifecycle) to `release` or rely on `publishConfig: { "access": "public" }` + plain `pnpm publish`. Rename the explorer package `explorer2` → `sdk-explorer`.
5. **Validate packaging** with `publint` and `@arethetypeswrong/cli` against `pnpm pack` output of each package; wire both as a root `check:pack` script.
6. `rimraf` → 6 (or replace `clean` scripts with `node -e 'fs.rmSync(...)'` — native-first, low value; keep rimraf if simpler).

**Exit criteria:** whole workspace builds on latest TS; every package passes publint + attw; `pnpm run test` still green; `tsconfig.base.json` is the single source of compiler truth.

---

## Phase 3 — Jest → Vitest

**Goal:** ESM-native testing with zero Node flags; Jest and its ecosystem removed.

**Steps**
1. Add `vitest` (catalog) with one small `vitest.config.ts` per package (`test.include: ['test/**/*.test.ts']`); root `test` script keeps fanning out via `pnpm -r`.
2. Port the suites: the Jest API is ~drop-in under Vitest's `globals: true` (or import `describe/it/expect` explicitly — preferred, per CODING_STYLE). Replace `jest-expect-message` usage with Vitest's native `expect(actual, message)` second argument.
3. Remove `jest`, `ts-jest`, `jest-expect-message`, `@types/jest`, all `jest.config.js` files, the `NODE_OPTIONS=--experimental-vm-modules` prefixes, and the `.npmrc` jest hoist pattern.
4. Keep the `watch:test` scripts (`vitest` watch mode is the default; `vitest run` for CI-style).

**Watch out for:** `crawler-react`'s test currently runs under the node environment with no React rendering — if component tests are ever added, that's when `jsdom`/`@testing-library` enter; don't add them preemptively.

**Exit criteria:** all suites green under Vitest with no Node flags; no jest packages or configs remain; coord-math pins intact.

---

## Phase 4 — Dependency upgrades & pruning (core, data, react)

**Goal:** the three publishable packages on current dependencies with pruned manifests. (`crawler-api` is Phase 6 — its upgrade is a rewrite, not a bump.)

**Steps**
1. **crawler-core** — no runtime deps; bump devDeps (`@types/node` 24, rimraf 6, typescript via catalog). Verify the DOM-vs-Node global handling (`window.CrawlerModules` / `global.CrawlerModules`) still typechecks under the new TS/lib settings.
2. **crawler-data** — same devDep bumps; peer `@avante/crawler-core` becomes `workspace:*` (dev) + a proper semver peer range for publishing (e.g. `^0.1.0`, kept in lockstep by the release process).
3. **crawler-react** — peer `react: ^18 || ^19`; devDeps `@types/react`/`@types/react-dom` 19. Audit the hooks for React-19 compat (no `defaultProps`, `useRef` arg) — they're plain hooks, so expect no changes.
4. Prune: any devDep no longer imported goes; no new runtime deps enter `core`/`data`.

**Exit criteria:** `pnpm outdated` clean (or exceptions documented here) for the three packages; build + tests green; React 19 consumer (ec-dapp) can link against `crawler-react` without peer warnings.

---

## Phase 5 — Publishing readiness: `core`, `data`, `react` to npm

**Goal:** `@avante/crawler-core`, `-data`, `-react` published — unblocking ec-dapp V2 Phase 9. `crawler-api` is explicitly **not** a prerequisite (ec-dapp talks to the chain via wagmi directly).

**Steps**
1. Versioning flow (decided 2026-07-08): **manual `0.x` lockstep** — all packages share one version, bumped together, published with `pnpm publish`. Changesets only if release cadence grows.
2. Verify the npm org/scope (`@avante`) access; `publishConfig.access: "public"` in each package.
3. Confirm `crawler-data` ships everything `@rsodre/crawler-data` consumers need (mainnet dataset parity — the ec-dapp adapter's `getChamberData`/`getTokenIdToCoords`/`getAllChambersViews`/`getChamberCount` equivalents are covered by the View/DataSet API).
4. Dry-run `pnpm pack` + install the tarballs into a scratch Next.js/Node project (both import paths: bundler + Node ESM); then publish.
5. Update README status table (`alpha` → published versions) and CLAUDE.md.

**Exit criteria:** three packages installable from npm; ec-dapp can begin its Phase 9 against them.

---

## Phase 6 — `crawler-api` repair (viem 2, viem-only)

**Goal:** un-break `crawler-api`: viem 1 + `@wagmi/core` 1 → **viem 2 only**; the package builds, tests pass, and its read API works against mainnet.

**Steps**
1. Replace the `@wagmi/core` `configureChains`/provider setup (`wagmi.ts`) with viem 2 `createPublicClient` + `http(rpcUrl)` transports; chains from `viem/chains`. RPC URLs are caller-supplied (provider-agnostic), not baked in.
2. viem 1 → 2 API sweep over `lib/calls/*`, `lib/views/*`, `lib/contract.ts` (readContract signatures, `Abi` typing — `as const` ABIs for inference).
3. Remove `prettier` from runtime deps: `formatter.ts` → `JSON.stringify(data, null, 2)` (native-first).
4. Bring the package through the Phase 2–4 treatment it skipped (exports map already landed in Phase 2; Vitest in Phase 3; verify both still hold after the rewrite).
5. Publish once green; flip README status `broken` → `alpha`.

**Exit criteria:** `crawler-api` builds and tests green on viem 2 with no `@wagmi/core` or `prettier`; on-chain reads verified against mainnet; published.

---

## Phase 7 — `apps/sdk-explorer` full modernization

**Goal:** **full modernization** (decided 2026-07-08) mirroring the ec-dapp stack: Next 16 App Router, React 19, wagmi 2 + ConnectKit 1.9 (ConnectKit caps wagmi at 2.x), Tailwind v4 replacing semantic-ui-react + sass, Biome replacing ESLint, native cookie handling replacing `react-cookie`. Follow ec-dapp's `CODING_STYLE.md` styling rules.

**Baseline note (2026-07-08):** the explorer does not build today — beyond the legacy stack, its own code is stale against the current core API (e.g. `client.tokenIdToCoord.get(1)` in `pages/data.tsx`); the port includes reconciling every page with the modernized SDK surface. Detail the step-by-step (route ports, primitive replacements) at phase start, borrowing ec-dapp's Phase 4–5 playbook.

**Exit criteria:** the explorer builds and runs against the workspace packages on the modern stack; `pnpm run build:all` green end-to-end.

---

## Out of scope (noted for later)

- **The global singleton dataset store** (`window/global.CrawlerModules`, `modules/importer.ts`) — process-global mutable state shared across clients, leaks between tests. A real refactor (per-client state) is an API redesign; do it deliberately, after ec-dapp Phase 9 exercises the current API.
- `@avante/crawler-contracts` (planned package) — still planned.
- New SDK features (Loot Underworld data sets, additional views).

## Milestones

- **M1 — Foundation:** Phases 0–1. Clean baseline; Node 24 + pnpm 10; Biome-formatted; editor config landed.
- **M2 — Modern packages:** Phases 2–4. Latest TS 5.x, correct ESM packaging (publint/attw clean), Vitest, current deps, React 19 peer.
- **M3 — Published:** Phase 5. `core`/`data`/`react` on npm — ec-dapp Phase 9 unblocked.
- **M4 — Full surface:** Phases 6–7. `crawler-api` repaired on viem 2; explorer fully modernized on the ec-dapp stack.

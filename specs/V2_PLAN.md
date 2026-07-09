# crawler-sdk — Modernization Plan

A phased plan to bring the Endless Crawler SDK monorepo up to a modern stack, adapted from the sibling `ec-dapp` modernization (`../ec-dapp/specs/V2_PLAN.md`). The scope here is smaller — the repo is already TypeScript, ESM, and a pnpm workspace — so this plan is about **tooling, dependency currency, packaging correctness, and publishing**, not a framework/UI migration. Each phase keeps the repo building and tests green so phases can ship independently.

**Baseline today (2026-07-08):** pnpm monorepo of 4 TS packages (`@avante/crawler-core|data|api|react`) + 1 Next.js 14 app (`apps/sdk-explorer`). Node 18 / pnpm 8 engines; TypeScript 5.3; Jest 29 + ts-jest in ESM mode (`NODE_OPTIONS=--experimental-vm-modules` + an `.npmrc` jest hoist pattern); tsc builds with bare `main`/`types` fields (no `exports` maps); tabs, no formatter/linter; a `.code-workspace` file instead of `.vscode/`. `crawler-api` is **broken** on viem 1 + `@wagmi/core` 1 (its `configureChains`/provider API no longer exists). `crawler-react` peers on React `^18`. The explorer runs Next 14 Pages Router + semantic-ui-react + sass + wagmi 1. **Install is currently broken:** package.jsons reference the `catalog:` protocol but no catalog is defined in `pnpm-workspace.yaml`, and the lockfile predates those refs (no `catalog` or `workspace:` entries).

**Strategic driver:** `ec-dapp` V2 Phase 9 waits on `@avante/crawler-core`/`-data`/`-react` being **published to npm** (with the same libs and data as `@rsodre/crawler-data`). Getting those three packages modern, correct, and published is the critical path; `crawler-api` and the explorer come after.

**Decisions:**
- **Mirror the ec-dapp toolchain** so the two sibling repos feel identical: Node **24.18.0** (latest LTS; verify at execution) pinned via `.nvmrc` + `.tool-versions` + `engines`; **pnpm 10.28.2** pinned via `packageManager` (pnpm 11 exists — stay on 10.x to match ec-dapp unless a needed feature forces the bump); **Biome** (root `biome.jsonc`, 2-space, single quotes, semicolons) as formatter + linter; `.vscode/settings.json` + `extensions.json` replace the `.code-workspace`.
- **pnpm workspace stays**, fixed: internal cross-package deps use **`workspace:*`** (replacing the dangling `catalog:` refs); shared external dev-dependency versions (typescript, vitest, @types/*) move to a real **pnpm catalog** in `pnpm-workspace.yaml`.
- All formatting/style rules live in **`specs/CODING_STYLE.md`** and apply to every phase.
- **Jest → Vitest**: ESM-native, kills the `--experimental-vm-modules` hack, `ts-jest`, `jest-expect-message` (Vitest's chai `expect(actual, message)` covers the custom messages), and the `.npmrc` hoist pattern.
- **TypeScript → latest** (7.0.2, the native compiler, at planning time; `6.0.0-beta` / the 5.9 line are the fallback if project references or a needed flag block 7 — verify at execution).
- **Published-library packaging done right**: `exports` maps + `files: ["dist"]` + `sideEffects: false`; `module`/`moduleResolution` **NodeNext** for the packages (requires explicit `.js` extensions on relative imports — mechanical sweep) so built output is valid ESM for both Node and bundler consumers; validated with **publint** + **arethetypeswrong**. (Alternative if extension churn is unwanted: bundle with `tsdown` — decide in Phase 2.)
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

## Phase 0 — Baseline & safety net

**Goal:** a known-good starting point: clean install, sequential build, and green tests on the current stack before anything moves.

**Steps**
1. **Fix the broken install**: replace every dangling `catalog:` ref with `workspace:*` (internal `@avante/*` deps), regenerate `pnpm-lock.yaml`, and confirm `pnpm install` succeeds from a clean checkout on the currently-pinned toolchain.
2. Run `pnpm run build` (sequential) and `pnpm run test`; record any gaps or flakes. The existing Jest suites — especially `crawler-core`'s coord/compass/slug bit-math tests — are the regression pin carried through every later phase.
3. Note the current explorer state (`pnpm --filter explorer2 build`) — it's allowed to stay broken/stale until Phase 7, but record whether it builds today.

**Exit criteria:** `pnpm install` + `pnpm run build` + `pnpm run test` green from a clean checkout; lockfile committed; baseline notes recorded.

---

## Phase 1 — Tooling foundation: Node/pnpm pins, Biome, editor config, format sweep

**Goal:** the repo's tooling matches ec-dapp — pinned modern Node/pnpm, one Biome config, `.vscode/` instead of the workspace file, and the whole repo formatted 2-space.

The format sweep must be its own commit (whitespace-only; `git blame -w` sees through it), separate from config/content changes.

**Steps**
1. **Node + pnpm pins:** `.nvmrc` + `.tool-versions` → `24.18.0` (verify latest 24.x LTS at execution); root `engines` → `"node": ">=24.18.0 <25.0.0"` (drop the pnpm entry); `packageManager: "pnpm@10.28.2"`. Remove the stale `engines` block from `apps/sdk-explorer/package.json`.
2. **Root `package.json` cleanup:** `"private": true` (the root is never published), add `@biomejs/biome` as a devDependency, add `lint` / `lint:fix` / `format` / `format:check` scripts (Biome, whole workspace), keep the existing build/test/watch proxy scripts.
3. **Workspace hygiene:** move shared external devDependency versions (typescript, vitest once it lands, `@types/node`, rimraf) into a `catalog:` section in `pnpm-workspace.yaml` and reference them via the catalog protocol — now actually defined.
4. `.vscode/settings.json` + `.vscode/extensions.json` (Biome as default formatter, 2-space, excludes) replace `crawler-sdk.code-workspace` — delete the workspace file. Root `biome.jsonc` per `specs/CODING_STYLE.md`. *(Landed 2026-07-08 alongside this plan.)*
5. **Run the repo-wide Biome format sweep** (tabs → 2-space) — **⏸ commit checkpoint: the sweep is its own whitespace-only commit.**
6. Run `biome lint` and tune rule levels in `biome.jsonc` against real output (mirror ec-dapp's approach: downgrade-with-comment for tracked debt, never silently disable).
7. Update `CLAUDE.md` (tabs → Biome/2-space, new pins, spec references) and the README's setup instructions.

**Watch out for:** pnpm 10's stricter defaults vs pnpm 8 — build scripts of transitive deps are no longer auto-run (`pnpm.onlyBuiltDependencies` opt-in if anything needs it); the lockfile format changes (expected, commit it).

**Exit criteria:** clean install/build/test on Node 24 + pnpm 10; repo is Biome-formatted and `pnpm lint` passes (0 errors; warnings only as commented tracked debt); `.code-workspace` gone; sweep is a separate commit.

---

## Phase 2 — TypeScript & packaging modernization

**Goal:** latest TypeScript, a modern shared tsconfig, and **correct published-ESM packaging** for all four packages — the prerequisite for publishing (Phase 5).

**Steps**
1. **TypeScript → latest** (7.0.x native at planning time) across the workspace via the catalog. If project references / `composite` or another needed flag isn't supported yet, fall back to the newest working release (`6.0.0-beta` / 5.9 line) and note it here.
2. **Modernize `tsconfig.base.json`:** `target: ES2022`, `lib: ["ES2022", "DOM"]`, `module`/`moduleResolution: NodeNext` for the packages, `isolatedModules: true`, `verbatimModuleSyntax: true`; keep `strict`, `declaration`, `composite`/references. The explorer app keeps `moduleResolution: bundler` in its own tsconfig.
3. **`.js` extension sweep:** NodeNext requires explicit extensions on relative imports in the packages — mechanical codemod, verified by the build. *(Decision point: if this churn is unacceptable, adopt `tsdown` to bundle instead and keep extensionless source — pick one, document here.)*
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
1. Decide versioning flow: manual lockstep versions (simplest, matches today's `0.1.0`) vs **changesets**. Default: manual `0.x` lockstep now, changesets only if release cadence grows.
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

## Phase 7 — `apps/sdk-explorer` modernization (decision gate)

**Goal:** decide the explorer's fate, then execute. It is the SDK's demo/dev surface, not a product — don't over-invest.

**Decision gate (pick at phase start):**
- **(a) Modernize** mirroring the ec-dapp stack: Next 16 App Router, React 19, wagmi 2 + ConnectKit 1.9 (ConnectKit caps wagmi at 2.x) or wagmi 3 without ConnectKit, Tailwind v4 replacing semantic-ui-react + sass, Biome replacing ESLint, native cookie handling replacing `react-cookie`. Follow ec-dapp's `CODING_STYLE.md` styling rules.
- **(b) Slim** to a minimal wallet-free data explorer (datasets/views/coord math only — the parts that don't need wagmi), deleting the web3 pages.
- **(c) Park** it: exclude from the workspace build, mark deprecated in README, revisit after ec-dapp Phase 9 proves the SDK surface.

**Exit criteria:** decision recorded here; if (a)/(b), the explorer builds and runs against the workspace packages on the modern stack; `pnpm run build:all` green end-to-end.

---

## Out of scope (noted for later)

- **The global singleton dataset store** (`window/global.CrawlerModules`, `modules/importer.ts`) — process-global mutable state shared across clients, leaks between tests. A real refactor (per-client state) is an API redesign; do it deliberately, after ec-dapp Phase 9 exercises the current API.
- `@avante/crawler-contracts` (planned package) — still planned.
- New SDK features (Loot Underworld data sets, additional views).

## Milestones

- **M1 — Foundation:** Phases 0–1. Clean baseline; Node 24 + pnpm 10; Biome-formatted; editor config landed.
- **M2 — Modern packages:** Phases 2–4. Latest TS, correct ESM packaging (publint/attw clean), Vitest, current deps, React 19 peer.
- **M3 — Published:** Phase 5. `core`/`data`/`react` on npm — ec-dapp Phase 9 unblocked.
- **M4 — Full surface:** Phases 6–7. `crawler-api` repaired on viem 2; explorer decision executed.

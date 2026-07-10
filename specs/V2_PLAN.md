# crawler-sdk — Modernization Plan

A phased plan to bring the Endless Crawler SDK monorepo up to a modern stack, adapted from the sibling `ec-dapp` modernization (`../ec-dapp/specs/V2_PLAN.md`). The scope here is smaller — the repo is already TypeScript, ESM, and a pnpm workspace — so this plan is about **tooling, dependency currency, packaging correctness, and publishing**, not a framework/UI migration. Each phase keeps the repo building and tests green so phases can ship independently.

**Baseline today (2026-07-08):** pnpm monorepo of 4 TS packages (`@avante/crawler-core|data|api|react`) + 1 Next.js 14 app (`apps/sdk-explorer`). Node 18 / pnpm 8 engines; TypeScript 5.3; Jest 29 + ts-jest in ESM mode (`NODE_OPTIONS=--experimental-vm-modules` + an `.npmrc` jest hoist pattern); tsc builds with bare `main`/`types` fields (no `exports` maps); tabs, no formatter/linter; a `.code-workspace` file instead of `.vscode/`. `crawler-api` is **broken** on viem 1 + `@wagmi/core` 1 (its `configureChains`/provider API no longer exists). `crawler-react` peers on React `^18`. The explorer runs Next 14 Pages Router + semantic-ui-react + sass + wagmi 1. **Install is currently broken:** package.jsons reference the `catalog:` protocol but no catalog is defined in `pnpm-workspace.yaml`, and the lockfile predates those refs (no `catalog` or `workspace:` entries).

**Strategic driver:** `ec-dapp` V2 Phase 9 waits on `@avante/crawler-core`/`-data`/`-react` being **published to npm** (with the same libs and data as `@rsodre/crawler-data`). **V2's job is to make those three packages modern and correct — not to publish them.** Publishing waits for the SDK refactor (`specs/SDK_PLAN.md`) to freeze the API and happens in its Phase F; V2 Phase 5 is deferred accordingly. So the V2 critical path is *readiness*: modern stack now, publish later.

**Decisions:**
- **Mirror the ec-dapp toolchain** so the two sibling repos feel identical: Node **24.18.0** (latest 24.x LTS, installed via **asdf**) pinned via `.tool-versions` + `engines`; **pnpm 10.30.1** (10.x confirmed; asdf-managed) pinned via `packageManager` + `.tool-versions`; **Biome** (root `biome.jsonc`, 2-space, single quotes, semicolons) as formatter + linter; `.vscode/settings.json` + `extensions.json` replace the `.code-workspace`.
- **pnpm workspace stays**, fixed: internal cross-package deps use the **workspace protocol** (`workspace:^` for published peers → publishes as `^0.1.0`; `workspace:*` for dev/app deps); **all common (multi-package) external versions live in the pnpm catalog** in `pnpm-workspace.yaml` and manifests reference them via `catalog:` — single-package deps stay inline.
- All formatting/style rules live in **`specs/CODING_STYLE.md`** and apply to every phase.
- **Jest → Vitest**: ESM-native, kills the `--experimental-vm-modules` hack, `ts-jest`, `jest-expect-message` (Vitest's chai `expect(actual, message)` covers the custom messages), and the `.npmrc` hoist patterns.
- **TypeScript stays on the 5.x line** for this modernization (bump to the latest 5.x; decided 2026-07-08) — TS 7 (the native compiler, `7.0.2` at planning time) is revisited after the modernization lands.
- **Published-library packaging done right** (decided 2026-07-09, revised): each package is **bundled with `tsdown`** (rolldown + oxc; tsup's successor) into a single `dist/index.js` + `dist/index.d.ts` — source stays idiomatic (extensionless imports, `moduleResolution: bundler`), no `.js`-extension sweep or JSON import attributes. Manifests get `exports` maps + `files: ["dist"]` + `sideEffects: false` + `publishConfig.access`; `tsc --noEmit` is the type-check gate; validated with **publint** + **arethetypeswrong** (`esm-only` profile). *(Superseded the earlier NodeNext + `.js`-extensions plan — the user preferred keeping source free of explicit extensions; tsdown produces equally-correct output with zero source churn.)*
- **`crawler-api` goes viem-only** (viem 2): the `@wagmi/core` 1 provider/`configureChains` API it uses is gone, and a viem-only core avoids coupling the SDK to a wagmi major (ec-dapp is on wagmi 2; wagmi 3 is current). Wagmi integration stays in the consumer (or `crawler-react` later).
- **`crawler-react` peers on `react: ^18 || ^19`** — ec-dapp (the primary consumer) is React 19.
- **Prune deps aggressively; prefer native platform resources** — e.g. `prettier` is a *runtime* dep of `crawler-api` only to pretty-print JSON (`formatter.ts`). ~~Replace with `JSON.stringify(data, null, 2)` and drop it.~~ **Superseded (2026-07-09):** `formatViewData` is the SDK's canonical dataset serializer and must stay *compact + human-readable* — a plain 2-space stringify regresses it. Its fate is owned by `specs/SDK_PLAN.md` (decision #11); do **not** swap it for `JSON.stringify(…, 2)` in V2 (see Phase 6, step 3).
- **Native `bigint` everywhere** — already the case in `crawler-core`; keep it that way.
- The **goerli dataset stays** in `crawler-data` (historical cached map data; the chain being dead doesn't invalidate the cache). `ChainId` keeps its current values.
- **CLAUDE.md is updated at the end of every phase** to reflect the new stack, commands, and architecture.

**Version facts (verified via npm, 2026-07-08):** typescript `7.0.2` (latest; `6.0.0-beta` bridge), vitest `4.1.10`, jest `30.4.2`, @biomejs/biome `2.5.3` (ec-dapp pins `2.5.2`), viem `2.55.0`, @wagmi/core `3.6.1` / wagmi `3.7.1`, react `19.2.7`, next `16.2.10`, pnpm `11.10.0` (latest) / `10.28.2` (ec-dapp pin), rimraf `6.1.3`, connectkit `1.9.2` (caps wagmi at 2.x).

## Dependency end-state

| Removed | Replaced by |
|---|---|
| `jest`, `ts-jest`, `jest-expect-message`, `@types/jest` | `vitest` (ESM-native; `expect(actual, message)`) |
| `.npmrc` `public-hoist-pattern[]=*jest*` | nothing (obsolete with Vitest) |
| `prettier` (runtime dep of `crawler-api`) | ~~`JSON.stringify(data, null, 2)`~~ → **TBD by SDK_PLAN #11** (must stay compact + human-readable; not a plain 2-space stringify) |
| `@wagmi/core` 1 (in `crawler-api`) | `viem` 2 only |
| `catalog:` refs without a catalog | `workspace:*` (internal) + a real pnpm catalog (shared externals) |
| `crawler-sdk.code-workspace` | `.vscode/settings.json` + `extensions.json` |
| explorer: `semantic-ui-react`, `semantic-ui-css`, `sass`, `react-cookie`, `eslint` + `eslint-config-next` | Tailwind CSS / native platform / Biome (Phase 7, mirroring ec-dapp) |

Kept: `rimraf` (bumped to 6), `@monaco-editor/react` (explorer).
Added: `@biomejs/biome`, `tsdown` (package bundler — replaced the per-package `tsc` emit build), `vitest`, `publint` + `@arethetypeswrong/cli` (CI-style pack checks).

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

## Phase 2 — TypeScript & packaging modernization ✅ (2026-07-09)

**Goal:** latest TypeScript, a modern shared tsconfig, and **correct published-ESM packaging** for all four packages — the prerequisite for publishing (Phase 5).

> **Done (2026-07-09).** Approach changed mid-phase from NodeNext+`.js` to **tsdown bundling** at the user's request (see the packaging decision above). Result:
> - **TypeScript → `^5.9.3`** (latest 5.x) via the catalog; **rimraf → `^6.0.1`**; **tsdown `^0.22.4`** added to the catalog + each package's devDeps.
> - **`tsconfig.base.json` modernized:** `target: ES2022`, `lib: ["ES2022","DOM"]`, `module: ESNext`, `moduleResolution: bundler`, `strict`, `isolatedModules`, **`noEmit` (tsc is type-check-only; tsdown emits)**. Added a `paths` map (`@avante/* → packages/*/src`, plus an explicit `@avante/crawler-core/internal` entry) so per-package `tsc --noEmit` resolves siblings from source without a prior build. The old per-package `tsconfig.build.json` files were replaced by `tsconfig.json` (`extends` base, `include: ["src"]`); the composite/project-references setup was dropped (no longer needed). Root `tsconfig.json` simplified (VSCode-only, no references). The explorer keeps its own standalone tsconfig (`moduleResolution: bundler`) — untouched.
> - **tsdown per package:** `tsdown.config.ts` (entry `src/index.ts` / `.tsx`, `format: 'esm'`, `dts: true`, `fixedExtension: false` so output is `index.js`/`index.d.ts` under `type: module`, `clean: true`). Build order stays `--sequential` (downstream dts needs core's dist).
> - **Manifests:** each package got `type: module` + `main` + `types` + an `exports` map + `files: ["dist"]` + `sideEffects: false` + `publishConfig.access: public`; the old `"publish"` script (shadowed the npm lifecycle) was removed; scripts are now `build: tsdown` / `typecheck: tsc --noEmit` / `clean: rimraf dist`. **crawler-core adds an `"./internal"` subpath export** (second tsdown entry from `src/modules/importer.ts`) exposing the `__`-prefixed dataset-importer plumbing that crawler-data + its tests need, keeping the public root clean. Explorer renamed `explorer2 → sdk-explorer` (Phase 1).
> - **Source fixups (minimal, idiomatic — no `.js` churn):** the two core barrels (`modules/index.ts`, `views/index.ts`) now split value vs `export type` re-exports (required by `isolatedModules` **and** rolldown); one real `any` in `crawler-react/useSideCoords.tsx` typed as `Dir` (that file was never type-checked before — the old build tsconfig only globbed `**/*.ts`, excluding `.tsx`).
> - **Packaging validated:** root `check:pack` = `publint --strict && attw --pack . --profile esm-only` over `./packages/*` (scoped to exclude the private root). **All four: publint "All good!" + attw green** (the CJS→ESM / node10 notes are `(ignored per resolution)` — the correct profile for ESM-only packages).
> - **Test resolution:** crawler-data's jest gets a `moduleNameMapper` shim for `@avante/crawler-core/internal` → core source (this legacy jest ignores `exports` subpaths; the CrawlerModules singleton lives on `globalThis` so the extra instance is harmless). Removed in Phase 3 with Vitest.
>
> **Gates:** `pnpm build` (tsdown, all 4) exit 0; `pnpm typecheck` 0 errors; `pnpm check:pack` exit 0; `pnpm lint` 0; `pnpm format:check` 0; tests at baseline (crawler-core 20, crawler-data 10, crawler-react skip; **crawler-api 4 failed = the pre-existing Phase 6 breakage**).

**Exit criteria:** whole workspace builds on latest TS 5.x; every package passes publint + attw; `pnpm run test` still green (minus crawler-api's known breakage); `tsconfig.base.json` is the single source of compiler truth. ✅

---

## Phase 3 — Jest → Vitest ✅ (2026-07-09)

**Goal:** ESM-native testing with zero Node flags; Jest and its ecosystem removed.

> **Done (2026-07-09).** Result:
> - **Catalog:** dropped `jest` / `ts-jest` / `@types/jest` / `jest-expect-message`; added `vitest: ^4.1.10` (latest). Every package swapped its jest devDeps for `vitest: catalog:`; `test` → `vitest run`, `watch:test` → `vitest` (watch is the default mode). `pnpm install` removed 173 packages / added 29; lockfile regenerated (catalog change forced a non-frozen install).
> - **Configs:** one `vitest.config.ts` per package (`test.include: ['test/**/*.test.ts']`, node env). The three downstream packages add `resolve.alias` entries mapping `@avante/*` to **source** (so tests run with no prior build) — the bare package name is an anchored regex (`/^@avante\/crawler-core$/`) listed after the `@avante/crawler-core/internal` string alias so it can't swallow the subpath (which points at `src/modules/importer.ts`). This replaces crawler-data's old jest `moduleNameMapper` shim; the two entry points resolving to distinct instances is harmless (CrawlerModules is a `globalThis` singleton).
> - **Removed:** all four `jest.config.js`, the `.npmrc` (both hoist patterns — `*jest*` from the start, `@types*` added in Phase 0 for ts-jest — were its only contents), and the `NODE_OPTIONS=--experimental-vm-modules` prefixes.
> - **Ported all 19 suites:** dropped `import 'jest-expect-message'` and added explicit `vitest` imports (`describe`/`it`/`expect`/`beforeAll`/`test` as used, per CODING_STYLE — no globals); `bitmap`/`client` gained imports they'd been relying on globals for. `jest-expect-message`'s `expect(actual, 'message')` works natively under Vitest (chai). No `jest.*` mocks/spies existed, so nothing else to port. The `BigInt.prototype.toJSON` polyfill in 5 core suites is untouched and still passes.
>
> **Gates:** crawler-core 20 passed / 3 skipped; crawler-data 10 passed; crawler-react 1 skipped; **crawler-api 4 passed / 4 failed = the pre-existing Phase 6 breakage** (`InvalidModuleError` dataset wiring + views-contract-address validation — unchanged by the port). `pnpm typecheck` 0 errors (test dirs aren't in `tsc`'s `include: ["src"]`, so dropping `@types/jest` didn't regress it); `pnpm lint` 0 errors; `pnpm format:check` 0 (the new configs were formatted on touch). Coord/bit-math pins intact.

**Steps**
1. Add `vitest` (catalog) with one small `vitest.config.ts` per package (`test.include: ['test/**/*.test.ts']`); root `test` script keeps fanning out via `pnpm -r`.
2. Port the suites: the Jest API is ~drop-in under Vitest's `globals: true` (or import `describe/it/expect` explicitly — preferred, per CODING_STYLE). Replace `jest-expect-message` usage with Vitest's native `expect(actual, message)` second argument.
3. Remove `jest`, `ts-jest`, `jest-expect-message`, `@types/jest`, all `jest.config.js` files (incl. crawler-data's `moduleNameMapper` shim for `@avante/crawler-core/internal` — Vitest resolves the subpath export natively via a workspace alias), the `NODE_OPTIONS=--experimental-vm-modules` prefixes, and **both** `.npmrc` hoist patterns (`*jest*` + `@types*`, the latter added in Phase 0 for ts-jest's type resolution under pnpm).
4. Keep the `watch:test` scripts (`vitest` watch mode is the default; `vitest run` for CI-style).

**Watch out for:** `crawler-react`'s test currently runs under the node environment with no React rendering — if component tests are ever added, that's when `jsdom`/`@testing-library` enter; don't add them preemptively.

**Exit criteria:** all suites green under Vitest with no Node flags; no jest packages or configs remain; coord-math pins intact.

---

## Phase 4 — Dependency upgrades & pruning (core, data, react) ✅ (2026-07-09)

**Goal:** the three publishable packages on current dependencies with pruned manifests. (`crawler-api` is Phase 6 — its upgrade is a rewrite, not a bump.)

> **Done (2026-07-09).** Result:
> - **Catalog bumps:** `@types/node` `^20.11.4 → ^24.13.3` (tracks the Node 24 engine), `react`/`react-dom` `^18 → ^19.2.7`, `@types/react` `^18.2.30 → ^19.2.17`, `@types/react-dom` `^18.2.14 → ^19.2.3`, `rimraf` `^6.0.1 → ^6.1.3`. TypeScript held at `^5.9.3` (latest 5.x; TS 7 is out of scope per the decisions). `vitest`/`tsdown` unchanged; `viem` stays `^1.10.3` (commented) until Phase 6.
> - **crawler-react peer:** `react` moved from `catalog:` to an inline **`^18 || ^19`** range — a two-major peer range can't be expressed by a single-version catalog entry, and the range is the publish-facing contract. `@types/react`/`@types/react-dom` come from the (now-19) catalog.
> - **crawler-data / crawler-api peers:** already correct from Phase 2 (`@avante/crawler-core: workspace:^` as peer → publishes `^0.1.0`; `workspace:*` as dev) — verified, no change.
> - **React-19 hook audit:** no code changes. The hooks are plain (`createContext` with a default, `useRef(false)` — already argumented); no `defaultProps`/`forwardRef`/`React.FC`/`ReactDOM.render`. Typecheck is clean under `@types/react` 19.
> - **Prune:** nothing removed. `@types/node` is kept in all three — crawler-core's `importer.ts` references `global`, and data/react typecheck that source transitively via the `paths` map, so dropping it breaks `tsc`. `@types/react-dom` has no import but is retained per step 3 (conventional for the React lib; its remit includes Components). No runtime deps entered core/data.
>
> **Gates:** `pnpm typecheck` 0 errors (all 4, under @types/node 24 + @types/react 19); `pnpm build` (sequential) exit 0; `pnpm check:pack` publint "All good!" ×4 + attw esm-only green; tests at baseline (core 20/3-skip, data 10, react 1-skip, **api 4-pass/4-fail = Phase 6**); `pnpm lint` 0 errors; `pnpm format:check` 0.
>
> **`pnpm outdated` (three packages) — documented exceptions only:** `@types/node` 24→26 (pinned to the 24 line to match the Node 24 runtime) and `typescript` 5.9.3→7.0.2 (staying on TS 5.x this modernization). React/viem no longer appear. The explorer emits React-18-peer warnings (semantic-ui-react / fluentui / react-popper) against the React-19 catalog — expected; those packages are removed in Phase 7.

**Steps**
1. **crawler-core** — no runtime deps; bump devDeps (`@types/node` 24, rimraf 6, typescript via catalog). Verify the DOM-vs-Node global handling (`window.CrawlerModules` / `global.CrawlerModules`) still typechecks under the new TS/lib settings.
2. **crawler-data** — same devDep bumps; peer `@avante/crawler-core` becomes `workspace:*` (dev) + a proper semver peer range for publishing (e.g. `^0.1.0`, kept in lockstep by the release process).
3. **crawler-react** — peer `react: ^18 || ^19`; devDeps `@types/react`/`@types/react-dom` 19. Audit the hooks for React-19 compat (no `defaultProps`, `useRef` arg) — they're plain hooks, so expect no changes.
4. Prune: any devDep no longer imported goes; no new runtime deps enter `core`/`data`.

**Exit criteria:** `pnpm outdated` clean (or exceptions documented here) for the three packages; build + tests green; React 19 consumer (ec-dapp) can link against `crawler-react` without peer warnings.

---

## Phase 5 — Publishing readiness: `core`, `data`, `react` to npm ⏸ DEFERRED — superseded by SDK_PLAN Phase F (2026-07-09)

> **Deferred out of V2 (2026-07-09).** V2 is *stack modernization to prepare for the SDK refactor* — it does **not** publish. `specs/SDK_PLAN.md` is explicit: the V2 packages are not published; the **first publish happens only after the refactor**, and SDK_PLAN owns it in its **Phase F — Data, API reference & first publish**. Every substantive step below either (a) is already satisfied by Phase 2 (`publishConfig.access: "public"` on all packages) or (b) validates/ships the **current** View/DataSet API, which the refactor replaces (schema replaces `moduleId`, `luw` is deleted, `crawler-data`'s eager exports become lazy descriptors — see SDK_PLAN decision #10). Verifying parity or publishing that surface now would only be redone. **Nothing to do here during V2.** The steps below stay as a reference checklist for Phase F to absorb. The npm `@avante` credential check is a one-time pre-publish task deferred with the publish itself.

**Goal (deferred to SDK_PLAN Phase F):** `@avante/crawler-core`, `-data`, `-react` published — unblocking ec-dapp V2 Phase 9. `crawler-api` is explicitly **not** a prerequisite (ec-dapp talks to the chain via wagmi directly).

**Steps**
1. Versioning flow (decided 2026-07-08): **manual `0.x` lockstep** — all packages share one version, bumped together, published with `pnpm publish`. Changesets only if release cadence grows.
2. Verify the npm org/scope (`@avante`) access; `publishConfig.access: "public"` in each package.
3. Confirm `crawler-data` ships everything `@rsodre/crawler-data` consumers need (mainnet dataset parity — the ec-dapp adapter's `getChamberData`/`getTokenIdToCoords`/`getAllChambersViews`/`getChamberCount` equivalents are covered by the View/DataSet API).
4. Dry-run `pnpm pack` + install the tarballs into a scratch Next.js/Node project (both import paths: bundler + Node ESM); then publish.
5. Update README status table (`alpha` → published versions) and CLAUDE.md.

**Exit criteria:** three packages installable from npm; ec-dapp can begin its Phase 9 against them.

---

## Phase 6 — `crawler-api` repair (viem 2, viem-only) ✅ (2026-07-09)

**Goal:** un-break `crawler-api`: viem 1 + `@wagmi/core` 1 → **viem 2 only**; the package builds, tests pass, and its read API works against mainnet.

> **Done (2026-07-09).** Result:
> - **viem 2 client (`lib/wagmi.ts` → `lib/client.ts`):** the `@wagmi/core` `configureChains`/provider stack is gone. Reads go through a viem 2 `createPublicClient` + `http(rpcUrl)`, with chains from `viem/chains` (`mainnet`, `goerli`). **RPC urls are caller-supplied** (provider-agnostic, not baked in): register with `setRpcUrl(chainId, url)` / `setRpcUrls(map)`, or pass `rpcUrl` per call; clients are cached per `${chainId}:${url}`; with no url, viem uses the chain's default public RPC. **Chain resolution now defaults to `ChainId.Mainnet`** when no `chainId` is given — this drops the dependency on core's `__resolveChainId`/dataset singleton for RPC (the old `InvalidModuleError` when calling reads with no options is gone).
> - **Catalog:** `viem` `^1.10.3 → ^2.55.0`. **Removed from `crawler-api` deps:** `@wagmi/core` and `prettier` (viem 1 + wagmi 1 stay in the store only as the explorer's transitive deps — Phase 7).
> - **`formatViewData` + `prettier` dropped** (not lossy-replaced, per decision / SDK_PLAN #11): `crawler-api` is a read layer that no longer writes datasets, so the serializer left with `prettier`. Its final home/form is owned by the SDK refactor (`specs/SDK_PLAN.md`). The explorer's `useFormatter` still imports it — reconciled in Phase 7 (the explorer doesn't build yet regardless).
> - **Types:** new `ReadOptions` (adds caller `rpcUrl`) is the base for `ReadContractOptions`/`ReadViewOptions`; `erc721.ts` calls take `ReadOptions`. Removed a stray `console.log` in `view.ts` and the dead `@wagmi/core` erc721ABI comment in `abis.ts`.
> - **Tests repaired (the 4 pre-existing failures):** `contracts.test.ts` now iterates the **imported DataSets** (`getDataSetNames()` → `getAllViews({ dataSetName })`) and checks each view's `metadata.contractAddress` against `getContractAddress()` — the old version iterated `getAllChainIds()` (incl. `Blank=0`, which has no dataset) and wrongly assumed `getAllViews({ chainId })` filters by chain. `erc721.test.ts` is **mainnet-only** now (goerli is dead): `beforeAll` calls `setRpcUrl(ChainId.Mainnet, …)` (default `ethereum-rpc.publicnode.com`, override via `MAINNET_RPC_URL`), 30s per-test timeout. Live reads verified: `totalSupply` 326, `ownerOf(1)` `0x8297…C798`.
>
> **Gates:** `pnpm typecheck` 0 errors (all 4); `pnpm build` (sequential) exit 0; `pnpm check:pack` publint "All good!" + attw esm-only green; `pnpm test` — **crawler-api 9 passed** (was 4-pass/4-fail), core 20/3-skip, data 10, react 1-skip; `pnpm lint` 0 errors (359 warnings, down from 373 — tracked debt); `pnpm format:check` 0.
>
> **Not published (per Phase 5 deferral):** step 5's publish is superseded by SDK_PLAN Phase F — V2 does not publish. README status was flipped `broken → alpha` to match the sibling packages.

**Steps**
1. Replace the `@wagmi/core` `configureChains`/provider setup (`wagmi.ts`) with viem 2 `createPublicClient` + `http(rpcUrl)` transports; chains from `viem/chains`. RPC URLs are caller-supplied (provider-agnostic), not baked in.
2. viem 1 → 2 API sweep over `lib/calls/*`, `lib/views/*`, `lib/contract.ts` (readContract signatures, `Abi` typing — `as const` ABIs for inference).
3. Remove `prettier` from runtime deps. **⚠️ Do NOT replace `formatViewData` with `JSON.stringify(data, null, 2)`** — that regresses the *compact + human-readable* dataset serialization the SDK requires (2-space stringify explodes every door/lock/bitmap array to one element per line, bloating and de-diffing the JSON). This serializer is now owned by the SDK refactor (`specs/SDK_PLAN.md`, decision #11): its final form (keep prettier vs. a small hand-rolled compact writer) is decided there, and it moves out of `crawler-api` into the dataset layer. For V2, the safe move is to **leave `formatViewData` as-is** (or drop it only if `crawler-api` no longer writes datasets) rather than swap in a lossy replacement.
4. Bring the package through the Phase 2–4 treatment it skipped (exports map already landed in Phase 2; Vitest in Phase 3; verify both still hold after the rewrite).
5. Publish once green; flip README status `broken` → `alpha`.

**Exit criteria:** `crawler-api` builds and tests green on viem 2 with no `@wagmi/core` or `prettier`; on-chain reads verified against mainnet; published.

---

## Phase 7 — `apps/sdk-explorer` full modernization ✅ (2026-07-09)

**Goal:** **full modernization** (decided 2026-07-08) mirroring the ec-dapp stack: Next 16 App Router, React 19, wagmi 2 + ConnectKit 1.9 (ConnectKit caps wagmi at 2.x), Tailwind v4 replacing semantic-ui-react + sass, Biome replacing ESLint, native cookie handling replacing `react-cookie`. Follow ec-dapp's `CODING_STYLE.md` styling rules.

> **Done (2026-07-09).** Result:
> - **Stack swap:** `next ^14 → 16.2.10`, `wagmi ^1 → ^2.19.5`, `connectkit ~1.6 → ^1.9.2`, added `@tanstack/react-query ^5.101.2`; **dropped** `semantic-ui-react`/`semantic-ui-css`/`sass`, `eslint`/`eslint-config-next`, and `react-cookie` (it was **never imported** — the plan's "native cookie handling" was moot, so it was simply removed). devDeps gained `tailwindcss`/`@tailwindcss/postcss`/`postcss ^4.3.2/^8.5.16`; manifest is now `type: module`, scripts `dev/build` use `--webpack`, `next lint` dropped for root Biome, `typecheck: tsc --noEmit` added. React/viem/TS come from the `catalog:`.
> - **Pages Router → App Router:** `pages/` deleted; `src/app/` holds `layout.tsx` (server: html/body, `metadata`/`viewport`, imports `styles/main.css`), `providers.tsx` (`'use client'`: `WagmiProvider > QueryClientProvider > ConnectKitProvider > CrawlerProvider > FetchProvider`, wagmi config via `getDefaultConfig`, lazy `useState(() => new QueryClient())`), and `page.tsx`/`data/page.tsx`/`apis/page.tsx`. The three `pages/api/*` handlers became App-Router `route.ts` (`api/hello`, `api/read/[...read]`, `api/view/[...view]`; async `params`); the Pages-only `[...error]` catch-all was dropped (App Router 404s natively).
> - **Tailwind v4, no config file:** `postcss.config.mjs` (`@tailwindcss/postcss`) + `styles/main.css` (`@import 'tailwindcss'`, `@theme` brand tokens `--color-ec-*` + `--font-mono`, self-hosted Noto Sans Mono `@font-face` from `public/googlefonts`, `:root` layout vars, `@layer base`/`components` porting the old drawer/header/results/`.anchor` classes). The scss (`styles.scss`, `googlefonts.scss`) is gone. `next.config.mjs` pins `outputFileTracingRoot`, keeps `transpilePackages`, aliases `@react-native-async-storage/async-storage` to `false` (silences the ConnectKit/wagmi/MetaMask-SDK warning) + wagmi node-fallbacks.
> - **Reconciled the stale SDK surface:** every core/react method the explorer calls **still exists** (verified) — the breakage was narrow. `formatViewData` (dropped from crawler-api with prettier in Phase 6) → replaced by a local bigint-safe `src/lib/formatData.ts` (2-space for the Monaco *display*, which is correct here — not the compact on-disk format SDK_PLAN #11 guards). `ReadContractResult` from `wagmi/actions` (wagmi 1, gone) → route returns `unknown` via a bigint-safe `jsonResponse`. RPC is caller-supplied since Phase 6 → `src/lib/serverRpc.ts` registers `setRpcUrls({ [Mainnet]: MAINNET_RPC_URL ?? publicnode })`, imported by the read/view routes. Semantic-UI primitives (`Divider`/`Grid`/`Icon`) → plain markup + Tailwind + inline-SVG icons; clickable `<span onClick>` → real `<button>`; the `useRouter` (`next/router`) header → `usePathname` (`next/navigation`). Dead `ConnectButton.tsx` duplicate of `Header` removed.
> - **Biome:** re-tightened the four Phase-7-tagged rules (`correctness/noSwitchDeclarations`, `security/noBlankTarget`, `a11y/useKeyWithClickEvents`, `a11y/noStaticElementInteractions`) back to recommended (error) — the rebuild cleared every offender (braced switch cases, `rel="noreferrer"`, `<button>` handlers); zero diagnostics repo-wide. Excluded the Tailwind entry `apps/sdk-explorer/styles/main.css` from Biome (its directives break the CSS parser) and removed the now-dead `!**/*.scss` ignore.
>
> **Gates:** `pnpm build:all` (`-r`, packages + `next build`) exit 0 — 6 routes (`/`, `/data`, `/apis`, 3 `api/*`); explorer `tsc --noEmit` 0 errors; `pnpm lint` 0 errors (272 warnings = pre-existing core/api tracked debt); `pnpm format:check` 0; `pnpm test` unchanged (core 20/3-skip, data 10, react 1-skip, api 9); `pnpm check:pack` publint "All good!" ×4 + attw esm-only green. **Runtime smoke (prod `next start`):** all pages 200; `/api/hello` OK; live mainnet `/api/read/1/CrawlerToken/totalSupply` → `326` (matches Phase 6) via the default public RPC; `/api/view/1/tokenIdToCoord/1/1` returns the coord record. **ConnectKit/React-19 peer warnings** (connectkit wants React 17/18) are expected and match ec-dapp's known-good setup.

**Baseline note (2026-07-08):** the explorer does not build today — beyond the legacy stack, its own code is stale against the current core API (e.g. `client.tokenIdToCoord.get(1)` in `pages/data.tsx`); the port includes reconciling every page with the modernized SDK surface. Detail the step-by-step (route ports, primitive replacements) at phase start, borrowing ec-dapp's Phase 4–5 playbook.

**Exit criteria:** the explorer builds and runs against the workspace packages on the modern stack; `pnpm run build:all` green end-to-end. ✅

---

## Out of scope (noted for later)

- **The global singleton dataset store** (`window/global.CrawlerModules`, `modules/importer.ts`) — process-global mutable state shared across clients, leaks between tests. A real refactor (per-client state) is an API redesign; do it deliberately, after ec-dapp Phase 9 exercises the current API.
- `@avante/crawler-contracts` (planned package) — still planned.
- New SDK features (Loot Underworld data sets, additional views).

## Milestones

- **M1 — Foundation:** Phases 0–1. Clean baseline; Node 24 + pnpm 10; Biome-formatted; editor config landed. ✅
- **M2 — Modern packages:** Phases 2–4. Latest TS 5.x, correct ESM packaging (publint/attw clean), Vitest, current deps, React 19 peer. ✅
- **M3 — Full surface:** Phases 6–7. `crawler-api` repaired on viem 2; explorer fully modernized on the ec-dapp stack. **This is where V2 ends** — the stack is modern and correct, ready for the SDK refactor. ✅
- **~~Published~~ → deferred to SDK_PLAN Phase F.** V2 does not publish. Phase 5 is superseded: the first npm publish of `core`/`data`/`react` (and the ec-dapp Phase 9 unblock) happens only after the SDK refactor freezes the API. See Phase 5's deferral note.

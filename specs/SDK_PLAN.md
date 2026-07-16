# crawler-sdk — SDK Refactor Plan

**Status:** _Implementation underway — **P1–P4 landed**_ (core rewritten to the settled spec, worlds migrated, the api contract layer, and the EC on-chain cache; execution detail in `specs/SDK_REFACTOR.md`). This refactor runs **after** the V2 modernization (`specs/V2_PLAN.md`) landed its stack work, but **before anything is published to npm** — the first publish happens only once this refactor is done (P9). V2 made the stack modern and correct; this plan makes the *API* the one we actually want, and that shipped API is what goes to npm.

**No back-compatibility constraint.** Because nothing is published yet, there are no external consumers to preserve. Break APIs freely between steps. The only in-repo consumers (`crawler-react`, `apps/sdk-explorer`) and the sibling `ec-dapp` all link the workspace and move in lockstep with us.

This is a **living document** to compile ideas and specifications. **Working model:** the user throws ideas and specs (via the **`/sdk-plan`** project command — `.claude/commands/sdk-plan.md`); Claude fits them into this doc and keeps it organized, and **asks when an idea conflicts with the current implementation or is internally inconsistent** rather than silently reconciling it. All state lives in this file and its sibling — the conversation is disposable, so a fresh clone + `/sdk-plan` resumes the work seamlessly. Sections marked **OPEN** are unresolved — fill them in as the direction firms up. Sections marked **DECIDED** are settled. The doc states **current facts only** — no dates, changelog narration, or supersession trails; when something settles or changes, its entry is rewritten to the outcome (git history carries the chronology).

**Two documents — single home per fact.** This file is the **brainstorm**: it owns everything **in flux** — open decisions, leans, rationale for pending trade-offs, current-code grounding, phases and gates. **`specs/SDK_SPECS.md`** owns everything **settled** — the full specification of a settled fact lives there and only there. When a decision settles, its final form is written into SPECS and the material here collapses to a **mention**: a pointer (**→ SPECS §Section**) plus at most the context remaining open decisions still need. The plan may *name* settled concepts while discussing open ones, but never restates their specification — a plan sentence detailed enough to drift from SPECS is in the wrong file. Spec changes are edited in SPECS directly (pointers here don't need touching); reopening a settled point moves it back here as OPEN and removes it from SPECS. Code and SPECS move in lockstep (see `CLAUDE.md`).

---

## What this SDK is — DECIDED

**This is a game *level-generation / level-data* SDK and tool — not a game, and not tied to one game.** It reads, interprets, and (when building datasets) canonically serializes generated dungeon/level data, across **whatever schema** a given game or generator produces. "Endless Crawler" is the name of the repo's heritage and its `ec` schema; it is *not* the scope.

- **Schemas = level-data formats from different games/generators.** `ec` (Endless Crawler's 16×16 packed-coord chambers) is the only real one today. The first *different* schema will be **`cnc` — Crypts & Caverns**.
- **`luw` (Loot Underworld) is dead.** It was a never-finished dataset kept as a placeholder; it will almost certainly never ship. **Scrap it everywhere** — code, types, tests, and this plan. It is *not* the future-schema example; `cnc` is.
- **Primary consumer: `ec-dapp` (Endless Crawler).** Design ergonomics and the published surface around a reader like ec-dapp first; keep everything else game-agnostic.

## Why refactor at all

The V2 plan already names the core wart in its "Out of scope" note: the SDK keeps its dataset state in a **process-global mutable singleton** (`window.CrawlerModules` / `global.CrawlerModules`, `modules/importer.ts`). That one decision radiates outward into most of what makes the current API awkward. The minimal thing we actually want is small and clear:

> **Multiple data sets, and one TypeScript library to read and interpret them — types included.**

Everything below is in service of that sentence, for level data of *any* schema.

---

## Direction — DECIDED

Three shaping decisions, chosen up front so the rest of the plan has a spine:

1. **API paradigm — functional core + thin wrapper.** Pure functions over plain, typed `DataSet` values are the *real* API (`getChamber(ds, coord)`, `coordToSlug(coord)`). A small optional wrapper composes those functions for ergonomics and for React; the functions never depend on the wrapper, the wrapper only ever delegates. The wrapper's shape is settled — per-world **handle** + multi-world **`Crawler` container**, living in core (#9/#4 closed → SPECS §The `Crawler` client).
2. **Variation axis — `schema`, not "game".** The SDK is schema-agnostic (see [What this SDK is](#what-this-sdk-is--decided)). Today only the **`ec`** schema has data; **`cnc` (Crypts & Caverns)** is the first planned *different* schema — its **cache + converter ship in v1**, so the seam is exercised for real (see Data pipeline / Out of scope). **Scrap `luw` entirely** — dead placeholder code, not a future extension. Build for one real schema now (`ec`) while treating schema as the clean seam for `cnc` and beyond. Schema-abstraction depth is settled — #8 closed, resolved by the `ChamberSchema`/`CoordinateSchema` split (→ SPECS §Schemas).
3. **Refactor approach — incremental, in-place.** Evolve `crawler-core` module-by-module, tests green at each step. No parallel greenfield package. Each stage is independently shippable, mirroring the V2 phase discipline.

These interact: having exactly **one live schema** (`ec`, once `luw` is deleted) is what *makes* the incremental in-place path tractable — most of the complexity being removed (namespaces, the `ModuleInterface`, the generic Compass) exists only to keep a second, never-shipped game generic. The schema concept lets us *name and validate* variation as data without re-building that machinery until `cnc` actually needs it (#8 — closed: the schema split).

---

## Core concept: dataset schemas

**Settled → SPECS §Schemas:** schemas as the variation axis (replacing `moduleId`); the `DataSchema` = `ChamberSchema` + `CoordinateSchema` split; the self-sufficiency invariant (the standard client needs no coordinate math); reusable coordinate schemas resolved from a name→library registry, all living in core; runtime descriptors with derived types (`as const satisfies DataSchema`); the `ec` and `cnc` descriptors (size policies, terrain domains, attribute sets); the world-fields vs schema-fields boundary.

Naming constraint kept for the record: the word is **`schema`** because **"layout" is taken** — a chamber's internal tile arrangement is its `tilemap` (the *chamber layout*), and overloading the word would be a permanent source of confusion.

Still in flux: **#14** — `cnc` has no native coordinates (interim rule: `coord = chamber ID`); the real mapping is unspecced and a **v1 blocker**.

---

## Core concept: Worlds & Views — DECIDED

**Settled → SPECS §Worlds & Views:** `World` (né `DataSet`) and its contract binding; views as named, typed keyed maps (`WorldInfo` singleton, `TokenCoord`, `ChamberData`), optional per world; placement & spawning (`TokenCoord` spawns chambers); provenance (views deliberately un-normalized); `ChamberData<Schema>` = normalized core + schema-typed `attributes`, with the full field mapping (#19, closed); terrain as a core property; readable string values; `Door` (`destCoord` / `isLocked` / `isEntry`, `getDoorsTo`); the dropped stored fields (`bitmap`, `slug`, `entryDir`, `locks`); key normalization. Raw token metadata lives in the `cache` layer, never in a world.

The current class-per-view `ViewAccess` build/load machinery (`views/view.tokenIdToCoord.ts:27`; `any`-typed `ViewValue`/`ViewRecords`, `views/view.ts:57–66`) is rejected — diagnoses #2/#3/#4; its replacement is settled (#13 closed → SPECS §Worlds & Views, absent-view semantics included). Converter binding & import ergonomics are settled too — `world.import(tokenId, payload)`, pure merge inside the `Crawler` (#1/#9 closed → SPECS §The `Crawler` client).

Still in flux:

- **Ownership (`TokenOwner`) — OPEN #17.** Dynamic by nature (transfer, delegation); may not be a view at all.

---

## Core data type: `BigIntish` — DECIDED

**Settled → SPECS §`BigIntish`:** the type (strict `` `0x${string}` `` hex), the dedicated `src/bigintish/` module in core, pure/total functions with defined error behavior, addresses as `BigIntish`, the exhaustive test matrix. (Subpath export: decided at the surface freeze, #7.)

**Landed at P1** — `crawler-core/src/bigintish/`: strict `` `0x${string}` `` `HexString`, guards, conversions with defined error behavior (`''`/garbage throw `InvalidBigIntishError`, never silently `0n`), the exhaustive test matrix.

---

## Data pipeline: caches, converters, builder, live chambers — DECIDED direction

**Settled → SPECS §Data pipeline & chamber sources:** provenance (every chamber comes from an ERC-721 token contract; the World binding); the pipeline — a single private `cache` package (pure `tokenURI` archive: one committed `json`+`svg` pair per token + a per-`dataDir` `_cache.json` provenance/state file, one dir per world, lean `worlds.json` registry, missing-only incremental fetch; schema-level invalidation deferred to #16 — #21) → per-schema pure converters in `crawler-data` (token payload in, SVG parsed back into the tilemap, on-chain supplements fetched by the payload assembler, single-place-to-fetch / single-place-to-convert rule) → the builder assembling world JSON via the canonical serializer (mainnet only — goerli frozen as migrated, sepolia when a deployment exists — #22); the live watcher in `crawler-api` (raw metadata out, caller converts, never our RPC); localStorage persistence in `crawler-react` only (node-compatible core); the publish cadence; and the three-tier chamber-source model (static → localStorage → on-chain, consumer-injected).

Still in flux: **#16** (live-chamber persistence & watcher mechanics) and the source-interface name (`ChamberSource`? — see glossary). SVGs are settled — original-only, shipped in the world, nothing playable in v1; ec-dapp's playable converter migrates into the SDK at P10 (#15 closed → SPECS §Worlds & Views, Token SVGs).

### Ownership & delegation — spec; mechanism OPEN (#17)

- **Owner helpers are served from `crawler-api`.** The usual need is narrow: **the connected player's chambers** — not a full ownership table.
- **Constraint: no indexers, no token enumerators.** Resolving a player's tokens must not depend on an off-chain indexer, and must not lean on `ERC721Enumerable` enumeration (`tokenOfOwnerByIndex` is one RPC call per token) — the mechanism must be RPC-frugal. **How, exactly, is OPEN (#17).**
- **Delegation via delegate.xyz — DECIDED as a requirement.** A connected player must be able to use tokens stored in a **different wallet** through [delegate.xyz](https://delegate.xyz). _(Not yet investigated — research the registry API/lookup cost before designing #17.)_
- **Is ownership a View at all? OPEN (#17).** Ownership is dynamic — tokens get transferred and delegated — so a static world view is stale by nature; it may live only as runtime api queries (possibly localStorage-cached like live chambers, #16).

---

## `crawler-api` — the contract layer (P3) — DECIDED

**Settled → SPECS §`crawler-api`** (#20 closed, illustrative code included): complete refactor into a **pure contract interface** — parsed results out, callers convert; fully-typed per-world viem contract instances (const-asserted ABIs); `getCardsContract()` + generic ERC-20/ERC-721 helpers; RPC-fallback `console.warn`; `BigIntish` addresses at every boundary; the view-definition machinery deleted; the serializer stays as the api's one non-contract member (#11); event listeners deferred to the live path (#16); the Starknet seam noted, not designed.

The P3 work **landed** (outcome in `SDK_REFACTOR.md`); final factory names still ride the surface freeze (#7).

---

## `apps/sdk-explorer` — browse tool & API provider — DECIDED direction

**Settled → SPECS §`apps/sdk-explorer`:** the browse-tool role, the dogfooding rule (public SDK surface only), the API-provider shape (#18, closed — same-origin data routes + converted on-chain routes, CORS opt-in), and visual browsing via the original token SVGs (playable form arrives with the P10 converter migration — #15 closed).

**Current state (grounding):** the explorer is a JSON console, not yet a browser: `/data` catalogs the core client surface, `/apis` triggers on-chain reads, and results render as JSON in a Monaco panel (`components/DataMenu.tsx`, `ApisMenu.tsx`, `Results.tsx`). There is **no SVG or map rendering of any kind yet**. The app's selection state lives in `SelectionContext` (`src/hooks/SelectionContext.tsx` — `SelectionProvider`/`useSelection`). A seed of the data API exists: `GET /api/read/...` and `GET /api/view/...` route handlers already serve on-chain reads with bigint-safe JSON (RPC registered server-side in `src/lib/serverRpc.ts`).

---

## Concepts & naming — working glossary

The shared vocabulary — every concept, its current best name, and status (**settled** / **lean** / **OPEN**). Settled rows are **index entries only**: the specification lives in SPECS. Update as names firm up.

| Concept | Name (status) | Notes |
|---|---|---|
| **Entry point** — owns the registered worlds and cross-world traversal | **`Crawler`** _(settled → SPECS §The `Crawler` client)_ | What a consumer creates first. Rejected: **`client`** (collides with web3 RPC clients), **`world`** (taken — the dataset's name). |
| **One map's data** | **`World`** _(settled → SPECS §Worlds & Views)_ | mainnet / goerli / sepolia. |
| **The specification a dataset conforms to** | **`Schema`** _(settled → SPECS §Schemas)_ | Named presets: `ec`, `cnc`. Replaces the `moduleId` axis. |
| **One named, typed keyed map inside a World** | **`View`** _(settled → SPECS §Worlds & Views)_ | `WorldInfo` / `TokenCoord` / `ChamberData`. |
| **Per-schema pure translator** — token payload → `ChamberData<Schema>` | **`Converter`** _(settled → SPECS §Data pipeline)_ | "adapter" rejected — implies interface-wrapping. World-bound import (`world.import`) settled → SPECS §The `Crawler` client. |
| **The converter's input** — cached tokenURI data + on-chain supplement | **Token payload** (`EcTokenPayload`, …) _(settled → SPECS §Data pipeline)_ | Types live beside their converter in `crawler-data`; core keeps only the generic `Converter` interface. |
| **Per-world on-chain snapshot** | **the `cache` package** _(settled → SPECS §Data pipeline)_ | One private, contract-agnostic package; one dir per world under `cache/data/<dataDir>` (`dataDir` includes the deployment). Pure `tokenURI` archive — layout & fetch discipline settled (#21). |
| **Pluggable chamber-data tier** | _(name OPEN — `ChamberSource`?)_ | The three-tier model is settled → SPECS §Data pipeline; only the interface name is open. |
| **A bigint in any representation** | **`BigIntish`** _(settled → SPECS §`BigIntish`)_ | |
| **A single room/node** in a dataset | **`Chamber`** _(lean)_ | Typed record; promotes today's `ChamberData`. |
| **The world's own info block**, stored as a view | **`WorldInfo`** _(working name; singleton-view direction settled → SPECS §Worlds & Views)_ | |
| **A schema-local gameplay extra** on a chamber | **`Attribute`** _(settled → SPECS §`ChamberData<Schema>`)_ | Terrain is **not** an attribute. |
| **A chamber's build material/biome** | **`Terrain`** _(settled → SPECS §`ChamberData<Schema>`)_ | Core property; per-schema string domain. |
| **Location, three representations** | **`Compass`** / **`Coord`** / **`Slug`** _(settled → SPECS §Schemas)_ | |
| **The two halves of a schema** | **`ChamberSchema`** + **`CoordinateSchema`** _(settled → SPECS §Schemas)_ | |
| **The first `CoordinateSchema`** | **`NEWS`** _(settled → SPECS §Schemas)_ | Reusable by other worlds. |
| **A direction** | **`Dir`** _(existing — NEWS-specific)_ | Not universal client API; optional/aesthetic on doors. |
| **A chamber's internal tile arrangement** | **`Tilemap`** _(settled)_ | The *chamber* layout — the reason "layout" is off-limits elsewhere. The **only** map representation; "bitmap" is retired (→ SPECS §`ChamberData<Schema>`), and "grid size" is **tilemap size**. |
| **A connection between chambers** | **`Door`** _(settled → SPECS §`Door`)_ | |
| **The token's original SVG, stored per world** | **`TokenSvg`** view _(settled → SPECS §Worlds & Views, Token SVGs)_ | Display-only; nothing playable stored or shipped in v1 — ec-dapp's playable converter migrates in at P10. |
| **Per-world accessor** bound to its schema | **World handle** _(settled → SPECS §The `Crawler` client)_ | Method-style, delegating to the functional core. |
| **Canonical dataset serializer** | **`formatViewData`** _(settled → SPECS §Canonical serialization)_ | Lives in `crawler-api`; do not remove it from there (the api's one non-contract exception — #11). |
| **Per-world typed contract instance** | **`getWorldContract()`** _(settled → SPECS §`crawler-api`; final name at #7)_ | viem `getContract` typed by the world's ABI. |
| **API reference website** | **`apps/docs`** (vocs) _(new; mechanism OPEN #12)_ | TSDoc + Twoslash over the exported surface. |
| **The browse & API tool** | **`apps/sdk-explorer`** _(settled role → SPECS §`apps/sdk-explorer`)_ | Current-state grounding in its section above. |

---

## Package map — in `SDK_SPECS.md`

The package inventory (each package, what it provides, published name, dependency rules) lives in **`specs/SDK_SPECS.md`** — the final-specification document. Keep it updated as decisions land (e.g. #17 owner helpers).

---

## Diagnosis — what was wrong with the pre-refactor design (all resolved by P1–P2)

Kept as the record grounding the remaining phases. Every item below was fixed by the P1–P2 core rewrite: the global store, `Options` bag, view `any`s, module/namespace ceremony, circular coupling, two-headed constructor, union compass, and DOM event bus are all gone from the codebase.

### 1. Process-global mutable singleton (`modules/importer.ts`)
Imported datasets don't live on a client — they live in `window/global.CrawlerModules`, keyed by `moduleId`, with a mutable "current dataset" per module. Consequences, all real today:
- **Clients aren't isolated.** Two `createClient()` calls for the same game share one dataset store and one "current" selection.
- **Tests leak into each other.** State survives across test cases unless manually reset.
- **Hidden mutation.** `setCurrentDataSet` mutates shared state; reads depend on invocation order.
- It exists to let any module method resolve "which dataset?" without being handed one — see #2.

### 2. The `Options` bag threaded everywhere (`types`, every view/module method)
Because state is global, nearly every method takes `options?: Options` to say *which* module / dataset / chain it means (`getView(name, options)`, `chamber.get(key, options)`, `resolveChainId(options)`). This is the global's tax paid at every call site. With explicit `DataSet` values passed in, most of it disappears.

### 3. Weak types exactly where types matter (`views/view.ts`)
`ViewValue = any`, `ViewValueModel = any`, `ViewRecords = { [key: string]: any }`. The record store — the thing consumers actually read — is untyped. The user's ask literally includes "including types"; this is the gap.

### 4. Heavy OOP + namespace ceremony for two games
`EndlessCrawler.Module` / `LootUnderworld.Module` are TypeScript **namespaces** wrapping classes that extend `ModuleBase` and implement a ~40-method `ModuleInterface` (`modules/modules.ts`). `ViewAccess` is an **empty marker interface**; `ViewAccessInterface` layers four generic params on top. This is a lot of structure to convert a bigint into a compass — and **most of it exists only to keep `luw` generic** (`module.luw.ts`, `coord.luw` tests, the `LootUnderworld` namespace). Since `luw` is dead, this whole layer is **deletable placeholder code**, not something to carefully preserve. One live schema + functional core removes it outright.

### 5. Circular module ↔ view coupling
`views/view.ts` imports from `../modules`; `modules/modules.ts` imports from `../views`. The layering isn't clean; "views" and "modules" know too much about each other.

### 6. Two-headed `createClient` (`modules/client.ts`)
Accepts *either* a `ModuleId` *or* a `DataSet[]`, with a `// TODO: create an empty DataSet` hole and a `withBlankDataset` boolean. One clear construction path is better.

### 7. `CompassBase` is a union of every game's fields
Every direction is optional (`north?`, `over?`, `domainId?`, …) so one interface can serve both games — so nothing is guaranteed present and every consumer null-checks. The `over?`/`under?`/`domainId?` fields exist only for the dead `luw`. A single-schema `ec` compass has exactly the fields that exist, all required. (When `cnc` lands, its compass is its own type, not a widened union — see decision #8.)

### 8. Browser-coupled event bus (`modules/events.ts`)
Events are dispatched as DOM `CustomEvent`s on `document` — a no-op in Node, subscribable only via raw `document.addEventListener` (which is what crawler-react's `useEvent` does, with a stale-closure risk from its empty dep array), and the payload is passed as the event *options* object instead of `{ detail }`, so it likely never reaches listeners. Resolution (#1, closed): only the coarse `Crawler` subscription survives — typed, environment-agnostic (→ SPECS §The `Crawler` client).

---

## Current-surface audit — placements for what the plan didn't cover

Everything the current packages contain that the sections above don't already place. Each row: what exists today (grounded), and its suggested disposition — all _(lean)_ until confirmed; the two items too big for a lean are promoted to decisions #18/#19.

| What exists today | Suggested fit in the new SDK |
|---|---|
| **Game vocabulary enums** — `Dir`, `TileType`, `Terrain` (+`OppositeTerrain`), `Gem`/`Hoard`; `Gem.Coin === Gem.Count === 8` collision (`crawler/constants.ts`) | **DECIDED** (→ SPECS §`ChamberData<Schema>`): `Terrain` → **core property**, string-valued, domain declared per schema; `Gem`/`Hoard` → `ec` **attributes**, string-valued. `Dir` and `TileType` are normalized-core topology vocabulary → stay in core _(lean)_. The numeric enums give way to schema-declared string domains (the `Gem` collision disappears with them). |
| **`Bitmap` namespace** — tilemap/bitmap pack/unpack (`toBitmap`, `toTilemap`, `findTilesInTilemap`), tile↔XY math, `flipDoorPosition`; 16×16 hardcoded; large dead commented block (`crawler/bitmap.ts`) | **DECIDED** (→ SPECS §`ChamberData<Schema>`, "Not stored"): the bitmap side (`BitmapIsh`, the `Bitmap` hex type, `toBitmap`) **vanishes** with the dropped stored field — no bitmap representation exists in the SDK. Everything else in the namespace is (mis-labeled) **tilemap** vocabulary and is kept as the tilemap helper library, typed + documented; tilemap size comes from the schema, not a constant; dead code deleted. `flipDoorPosition` gains a spec role: it computes `Door.destTile` (→ SPECS §`Door`). |
| **Slug separators** — parse/emit with `,` default, also `''` `.` `;` `-` (`modules/modules.ts:43-45`; regex in `module.ec.ts:242`) | Part of the `ec` schema's slug spec: accept any separator on parse, emit the canonical default. Rides with decision #8. _(lean)_ |
| **`ContractName` enum in core** — ETH contract names in `views/chains.ts:34` (only `CrawlerToken` active; "move somewhere else" TODO) | Contract identity moves onto the World binding (`{ network, chainId, contractAddress, contractName }`); the api's artifact registry resolves ABIs by `contractName`; core carries the binding as data only, no ABIs. _(lean)_ |
| **`Utils` grab-bag** — datetime formatters, `Math.random` helpers, lerp/clamp/deg-rad math, `minifyObject`, platform detection; `isString` tests for `bigint` (bug) (`utils/`) | Drop from the public surface (small-API principle): bigint fns are absorbed by `bigintish`; what core needs stays private; datetime/random/general math are consumer concerns. _(lean)_ |
| **Error classes** — seven, mostly global/module-machinery; `InvalidChainError` never thrown (`types/errors.ts`) | Machinery errors die with the machinery; design a small typed error set alongside the new surface (documented `@throws`, per the docs spec — `bigintish` already specs defined error behavior). _(lean)_ |
| **`transform()` build logic** — derives compass from coord, `entryDir` from the tilemap's Entry tile, `isDynamic` from lock count (`views/view.chamberData.ts:127`) | This *is* the embryonic EC **converter** — the logic migrates into `crawler-data`'s converter. The field mapping it feeds is decision #19. _(lean)_ |
| **On-chain view reads** — `readViewRecordOrThrow`/`readViewTotalCount` over `coordToChamberData`/`tokenIdToCoord` on `CrawlerToken`; args hardcoded `[0, key, true]` (chapter 0, generateMaps true); instantiates core clients internally (`crawler-api/lib/view.ts`, `lib/views/*`) | **Deleted, not migrated** (P3 → SPECS §`crawler-api`): the api's view-definition machinery and types are irrelevant in the new model. The **on-chain `ChamberSource`** is built on the typed world contract instead — raw/parsed data out, the *caller* converts (the `Crawler`'s bundled converter registry, → SPECS §The `Crawler` client); api still never depends on crawler-data. The hardcoded `chapterNumber`/`generateMaps` dissolve with the machinery — typed contract reads take explicit args. _Executed: machinery deleted at P2, typed world contract landed at P3; the on-chain `ChamberSource` itself rides the live path (P8)._ |
| **Contract registry + dead artifacts** — `Contracts` registers only `CrawlerToken`; ~96 unreferenced Truffle artifacts in `contracts/crawler|cards`; ABI types are `any`; artifact carries a dead Ganache network `5777` (`lib/abis.ts`, `lib/contract.ts`) | Keep only live contracts (CrawlerToken; the EC Cards contract(s) — `getCardsContract()`; C&C's contract when added) as their original artifact JSON, with the typed ABI form **derived by build-time codegen, never committed** (→ SPECS §`crawler-api`); the registry resolves **ABI by `contractName` only** — addresses come from the World binding or the caller, the artifact `networks` tables die; delete the dead trees (P3 → SPECS §`crawler-api`). _Executed at refactor P3 (8 live artifacts in `src/artifacts/`, codegen via the package `gen` script)._ |
| **Silent Mainnet default** — reads with no `chainId` silently hit Mainnet (`lib/client.ts:65`) | Resolved by the P3 direction: the chain always comes from the world's contract binding; a missing `rpcUrl` falls back to viem's default public RPC **with a `console.warn`** — never silent (→ SPECS §`crawler-api`). _Executed at refactor P3._ |
| **Address utils** — `formatAddress`, `isSameAddress`, `isZeroAddress`, `validateAddress` (`lib/utils/utils.ts`) | Equality/zero checks become `BigIntish` comparisons; `formatAddress` (display shortening) is UI — explorer-side or dropped. _Executed at refactor P3 (utils deleted; nothing consumed `formatAddress`)._ |
| **Per-view JSON `metadata`** — `{chainId, contractName, contractAddress, timestamp: 0}` duplicated in every view file, never stamped (`crawler-data/src/data/*`) | Superseded by the **`WorldInfo` view** (single world-level info block — see Worlds & Views); the builder stamps real timestamps. Restructured by the P2 one-off migration (#6 closed). |
| **crawler-react scaffolding** — inert reducer (`SET_SOMETHING`, `chambers: []`), `dispatchChamberData` writing straight into the core global store, `useEvent` DOM bridge, `useConsole*`/`useEffectOnce` misc hooks (`context/CrawlerContext.tsx`, `hooks/`) | Delete with P8: the provider holds the `Crawler` container and hooks read it; misc hooks leave the public surface; reactivity comes from the `Crawler`'s coarse subscription (→ SPECS §The `Crawler` client). _(lean)_ |

Not listed: everything `luw`-only (its unimplemented `slugToCompass`, `Domain` enum, `makeRealmEntryChamberIdFromCoord`) — covered by "`luw` is deleted"; and the chamber query methods (`getMultiple`, static/dynamic counts, `getTokensCoords`) — already in Goals ("enumerate chambers; counts"), enumerated exactly at the surface freeze (#7).

---

## Goals & minimal feature set

**Must have (the sentence):**
- Load **multiple datasets** as first-class, explicit, typed values — no global, no implicit "current".
- **Import only what you need:** each world is its own subpath export — bundles and memory carry exactly the worlds a consumer imports (decision #10).
- **Fully documented, published API reference:** every exported API carries vocs-compatible TSDoc, feeding an API-reference site at **`apps/docs`** (hard spec — see Design principles and decision #12).
- **Read** a dataset: look up a chamber by coord / tokenId / slug; enumerate chambers; counts (static/dynamic).
- **Interpret** coordinates: the Compass ↔ Coord ↔ Slug conversions and per-chamber offset/neighbor math.
- **Types** all the way through: a typed `Chamber`, typed dataset/view access, no `any` in the read path.

**Nice to have / keep working:**
- The React bindings (`crawler-react`) keep working — ideally get simpler because state is explicit.
- Off-chain cached data (`crawler-data`) keeps loading — via the one-off shape migration (#6 closed).
- Reactivity: the coarse "world updated" subscription on the `Crawler` replaces per-record events (#1 closed → SPECS §The `Crawler` client).

**Explicit non-goals here:** new game features. (`crawler-api` is **in scope** — complete refactor at P3, see its section.) The `cnc` **cache + converter are v1 goals** (see Out of scope); `luw` is deleted, not deferred.

---

## Design principles (proposed — refine as we go)

- **Data is data.** A `World` (né `DataSet`) is a plain, serializable, deeply-typed value. Functions take it and return values; they don't hide it. Corollary (settled → SPECS §Worlds & Views): a world JSON is fully usable *without* the SDK.
- **No ambient state.** Nothing reads from a global. If a function needs a dataset, it's a parameter.
- **Pure by default.** Reads are pure; loaded worlds are immutable, live data folds in by pure merge (#1 closed → SPECS §The `Crawler` client, read model).
- **Types are the spec** — settled → SPECS §Type-system rules (no `any`, literal-union lookup names, descriptor-derived types).
- **Small public API.** Prefer a handful of well-named functions over a 40-method interface.
- **Minimal game = core + data** — settled → SPECS (minimal-consumer rule).
- **Thin wrapper, no logic** — settled → SPECS §The `Crawler` client (the wrapper composes the functional API; it never contains behavior the functions don't already expose).
- **No ambient selection.** No mutable "current dataset" in core — cross-dataset jumps can't express it and it re-creates the global-state smell.
- **Import only what you need** — settled, #10 closed → SPECS §Package map (one subpath export per world; the root ships no world JSON; hard constraint, not an optimization).
- **Canonical dataset serialization** — settled, #11 closed → SPECS §Canonical serialization (hard constraint: every dataset create/update round-trips through `formatViewData`).
- **Documented public surface** — settled → SPECS §Type-system rules (complete TSDoc on every export; Twoslash-verified examples); the generation mechanism is #12. Note: today's comments use non-idiomatic `@type` JSDoc tags — convert to proper TSDoc during the typing work.
- **Native `bigint`, ESM, tree-shakeable** (inherited from V2: `sideEffects: false`, `exports` maps).

---

## Target API — settled

**→ SPECS §The `Crawler` client** — the former strawman is now the settled shape (handle + container, sync static reads, door-based navigation, schema-bound coordinate math, immutable worlds + pure merge + coarse signal) and lives there, illustrative code included. What remains open here: the **exact method inventory**, drafted at the surface freeze (#7).

---

## Data model notes

- **Views:** settled → SPECS §Worlds & Views (#13 closed — absent-view semantics and no-per-view-subpaths included); landed at P2 (`worldInfo`/`tokenCoord`/`chamberData`), `tokenSvg` landed with the P6 builder.
- **`Chamber` type:** settled → SPECS §`ChamberData<Schema>` (#19, closed). Kept from today: the *input model* (`ChamberDataModel`) vs *stored/read type* split — sound today, worth keeping — and the Solidity-struct doc comment (`views/view.chamberData.ts`).
- **World shape:** target settled → SPECS §Worlds & Views. Grounding: today's `DataSet` is `{ moduleId, dataSetName, chainId, views }`. Bridging old JSON to the new shape is settled (#6 closed): a **one-off migration script** at P2; the P6 builder re-emits the same shape from cache.
- **Chains:** target settled → SPECS §Chains. Grounding: `views/chains.ts` (`ChainId` Blank/Mainnet/Goerli, + sepolia incoming); goerli data stays (V2 decision: dead chain, valid cache).
- **Canonical serializer:** #11, closed → SPECS §Canonical serialization.
- **Cross-world doors (future).** A chamber in world A will eventually connect to a chamber in world B. The **`Door` element is where the connection lives**: `destCoord` today; a cross-world door widens the destination to a **world-qualified** form (`{ world, coord }`). A same-world neighbor is the degenerate case. **OPEN:** how the destination world is identified in stored data. The `Crawler` container owns cross-world traversal (settled → SPECS §The `Crawler` client).

---

## Implementation phases — broad-strokes checklist

Build order: consumption-first — types, then the core that reads them, then the pipeline that produces data, then the apps; **C&C last**, exercising the whole chain a second time. The old refactor spine (de-globalize, functional extraction, `luw` deletion) rides inside P1–P2. TSDoc is definition-of-done in every phase. Per-phase execution detail (current-code dispositions, step order) lives in **`specs/SDK_REFACTOR.md`** — implementation is underway there, starting with P1–P2.

- **P1 — Types & schemas. ✅ LANDED.** `bigintish/`, the `DataSchema` descriptors + derived types, `ChamberData<Schema>` + `Door`, `World`/`View` types, chains rework, no `any` anywhere in core, `luw` deleted.
- **P2 — Core / client. ✅ LANDED.** Global store + `Options` bag + module/namespace ceremony + DOM events deleted (`./internal` subpath gone); functional read surface (`loadWorld`, pure per-view reads, pure merge); the NEWS library (`coords/news`, ec fixtures pass unchanged) + name→library registry; `createCrawler` + `Crawler` + `WorldHandle` + `Chamber` + coarse subscription + `Converter`/chamber-source interfaces; the one-off migration script (`crawler-data/scripts/migrateWorlds.ts`) rewrote mainnet+goerli to the World shape (277/70 tokens, door `destCoord`/`destTile` derived, validated by `loadWorld` + invariant tests). Consumers ride keep-lights-on passes: api's view machinery deleted early (P3 deletes it anyway) with `formatViewData` brought to spec (replacer, no monkeypatch); react holds a `Crawler` (`useCrawler`/`useWorld`/`useChamber`/`useWorldNames`); explorer re-pointed (its `/api/view` route + converted-read menus parked until P3/P7).
- **P3 — api contract layer. ✅ LANDED.** The typed contract surface (→ SPECS §`crawler-api`; outcome in `SDK_REFACTOR.md`): ABI codegen (artifact JSON → git-ignored const-asserted TS, regenerated before every build/typecheck/test), `getWorldContract` + cards/ERC-20/ERC-721/typed factories, parsed-result helpers (`readTokenMetadata`/`readTotalSupply`/`readOwnerOf`), warned public-RPC fallback, `BigIntish` boundaries; the global RPC registry + untyped read path deleted (`formatViewData` stayed put — #11); explorer `/api/read` re-pointed keep-lights-on. (Watcher/events and ownership come later — P8/P10.)
- **P4 — EC cache. ✅ LANDED.** The single private `cache` package (outcome in `SDK_REFACTOR.md`): one generic `fetch:tokens` script archives every token's `tokenURI` via P3 — block-pinned, missing-only, RPC-required, ≤ 10 req/s — into a `json`+`svg` pair per token (SVG prettier-formatted) + a per-`dataDir` `_cache.json` (binding echo + watermark + per-token stamps); mainnet landed at **326 tokens** (goerli unfetchable/frozen). The P3 read helpers gained optional block-pinning (`ReadOptions`). Invalidation is an empty schema-level core policy (Minted-neighbour deferred to #16). _Gates: none — #21/#22 closed (→ SPECS §Data pipeline)._
- **P5 — EC converter. ✅ LANDED.** `EcTokenPayload` → `ChamberData<ec>` (outcome in `SDK_REFACTOR.md`): pure, sync, struct-fed — **no SVG parsing** (the cache embeds the on-chain `chamber` struct, so map facts incl. `seed` ride in the payload; the SVG passes through display-only); readable facts normalized from the traits; the migration's derivations reproduced and pinned by the equivalence suite over the full cache.
- **P6 — EC world data (builder). ✅ LANDED.** The builder (`crawler-data`'s `build:worlds`, outcome in `SDK_REFACTOR.md`) re-emits mainnet from the cache via the canonical serializer (#11) — fully offline, deterministic, `worldInfo` re-stamped, first `TokenSvg` view; goerli stays frozen as migrated (still shipped); `crawler-data` moved to per-world subpath exports (root ships no world JSON); `migrateWorlds.ts` retired. _Gates: none — #6/#22 closed._
- **P7 — sdk-explorer.** Rebuild on the new API: browse the tiers (original token SVGs) + the **same-origin data API** — data routes and converted on-chain routes (#18, closed). Ordering wrinkle: today's explorer depends on `crawler-react` — it may consume core directly until P8 lands, or pull minimal react bindings forward. _Gates: none._
- **P8 — react.** Simplify provider/hooks over the `Crawler` (delete the scaffolding); the live path lands here: watcher in `crawler-api`, localStorage chamber source + persistence in `crawler-react`. _Gate: #16._
- **P9 — Publish.** Freeze the public surface (#7, with #3's export inventory); complete TSDoc + stand up `apps/docs` (#12); update README + CLAUDE.md; **first npm publish** of `core`/`data`/`api`/`react`. _Gates: #3, #7, #12._
- **P10 — Import into Endless Crawler (ec-dapp).** Migrate ec-dapp onto the published packages (its V2 Phase 9 dependency); owner helpers + delegate.xyz land with the game's needs (#17); **migrate ec-dapp's original→playable SVG converter into the SDK** (#15 residual). _Gate: #17._
- **P11 — C&C cache & world building.** The C&C world added to the `cache` package (`dataDir: cryptsandcaverns`); the `cnc` schema, converter, and world build — the multi-schema seam exercised end-to-end. _Gate: #14 (still the v1 blocker)._

_(Broad strokes; split or resequence as decisions land.)_

---

## Open decisions — grouped by implementation phase

Numbers are **stable identifiers** (cross-referenced throughout the doc), not an order; the grouping shows *when* each must be decided. Closed decisions are kept at the end.

### Decide for P8 — react & live path

- **#16 — Live-chamber persistence & watcher mechanics.** _(the requirement is settled — real-time new-minted chambers, localStorage so refreshes don't refetch, node-compatible core; mechanics OPEN.)_ Sub-questions:
  - **What's persisted:** raw metadata vs converted `ChamberData` (plus `TokenCoord` placement). _Lean: converted, keyed by world + tokenId — conversion is deterministic, so storing the output avoids re-running converters on every load._
  - **Pruning:** when a `crawler-data` redeploy (daily/weekly cadence) folds those tokens into the static world, the localStorage entries become redundant. _Lean: prune on load whenever tier 1 already has the token._
  - **Watch mechanism:** contract event subscription vs polling `totalSupply` (`readTotalSupply` exists — `lib/calls/erc721.ts`) vs on-demand fetch on cache miss. Must respect the never-our-RPC rule.
  - **Staleness / neighbour invalidation (shared with the cache).** A schema-level policy in `crawler-core`: given a newly-changed coord, which existing chambers are now stale? For `ec`, a mint invalidates its **NEWS-neighbour** chambers (their doors change as the new chamber unlocks them); `cnc` invalidates nothing (static maps). This is the **same mechanic** on both sides — the cache scans `Minted` from `_cache.json`'s `fetchedThroughBlock` to build a refetch list; a live client runs the identical primitive to pull recent chambers not yet in `crawler-data` and route them through `world.import`. Design it once here, expose one pure `crawler-core` primitive (over the coords library's neighbour offsets), and have both callers use it. _P4 ships an **empty** policy (missing-only fetch) with the block + watermark data already banked in `_cache.json`; needs a coord→tokenId index (buildable from cached metadata) to light up. EC's boundary is why the blanket `#Locked`-refetch idea was dropped — too broad._
  - The merge itself is settled (#1 closed): `world.import(tokenId, payload)` → convert + pure merge + swap inside the `Crawler`, coarse signal fired (→ SPECS §The `Crawler` client). Only the *trigger* mechanics above remain open here.

### Decide for P9 — publish

- **#3 — Package boundaries.** **Boundary criterion — DECIDED: everything that deals directly with `ChamberData` lives in `crawler-core`.** A game can import **`crawler-core` + one world from `crawler-data`** and build a complete game; **`crawler-api` and `crawler-react` are strictly optional** (live real-time updates and web helpers, respectively). The package split stays _(leaning: keep `core`/`data`/`api`/`react` — matches published names and ec-dapp's consumption; the workspace grows around them — a single private `cache` package, converters + builder inside `crawler-data` (build-script devDep on `crawler-api` only), watcher + owner helpers inside `crawler-api` — the published set unchanged)_. Remaining: the full per-package export inventory, drafted with the surface freeze (#7).
- **#7 — Public surface freeze.** What's the exact exported function list? Draft it once decisions 1–2 and 8 land.
- **#12 — API-reference generation mechanism.** _(the *requirement* is settled — TSDoc'd surface + `apps/docs` on vocs; the *how* is OPEN.)_ Verified: **vocs renders MDX and type-checks code samples via Twoslash, but does not auto-extract TSDoc into reference pages.** So decide how reference pages are produced:
  - **(a) Hand-authored MDX** per API (the viem/wagmi model), examples Twoslash-verified against real signatures. Most polish/control; manual upkeep as the surface grows.
  - **(b) Generated MDX from TSDoc** via a TypeDoc-style step (`typedoc` + `typedoc-plugin-markdown`, or api-extractor/api-documenter) that vocs then renders. Less manual work; coarser output; extra tooling in the pipeline.
  - **(c) Hybrid** — generated symbol reference (stays complete + in-sync) + hand-authored guides/overviews (carry the narrative).
  - _Lean: (c)._ Also decide: does `apps/docs` build gate CI (broken Twoslash example / undocumented export ⇒ red)? _Lean: yes — that's what makes "documented surface" enforceable._ Confirm before standing up `apps/docs`.
### Decide for P10 — Endless Crawler import

- **#17 — Player-owned chambers: ownership resolution.** _(requirement settled — owner helpers served from `crawler-api`, scoped to the connected player; delegate.xyz support required; mechanism OPEN.)_ Sub-questions:
  - **RPC-frugal lookup:** resolve the connected player's tokens **without indexers and without `ERC721Enumerable` enumeration** (one call per token). Candidates to evaluate: `Transfer`-event log scans (`eth_getLogs` on the two `Transfer(from|to=player)` filters, cached by block range), multicall batching, or accepting enumeration for small collections. Unresolved.
  - **View or not:** is ownership a world view (`TokenOwner`) at all? It's dynamic (transfer, delegation), so a static view is stale by nature — it may be runtime-api-only, optionally localStorage-cached (#16). _Naming lean: `TokenOwner` (consistent with `TokenCoord`)._
  - **delegate.xyz:** a connected player can use tokens stored in a different wallet. **Not yet investigated — research later** (registry lookup API, RPC cost, chain coverage) before designing this decision.

### Decide for P11 — C&C

- **#14 — `cnc` coordinate mapping.** Crypts & Caverns dungeons have **no native coordinates**, but `ChamberData` is keyed by coord (decided) and gameplay navigates by neighbor-coord math. Interim rule: **`coord = chamber ID`**; the `cnc` importer must map/derive real coordinates. How they're calculated is unspecced — capture the spec when it arrives. **A v1 blocker:** the `cnc` converter ships in v1 and can't emit coord-keyed `ChamberData` without this.

### Closed

- **#1 — CLOSED.** Immutable read model: a loaded `World` has no `.set()` and no per-record events; live chambers fold in via **pure merge** (`world.import` → new value, swapped inside the `Crawler`); the only reactivity primitive is a **coarse, typed, environment-agnostic "world updated" subscription on the `Crawler`**. The build path is a separate surface (the data pipeline). → SPECS §The `Crawler` client.
- **#4 — CLOSED.** The wrapper lives in **`crawler-core`**, framework-agnostic; `crawler-react` merely holds it. → SPECS §Package map.
- **#9 — CLOSED.** Wrapper shape **(a): per-world handle + `Crawler` container**, method-style over the functional core; sync for all static data; worlds by name; chamber back-pointer; no mutable "current world". Rejected (b) one-client-explicit-refs (verbose call sites) and (c) pure-functions-only (the world registry and `world.import` have no home; `import` is a reserved word as a bare function). Exact method inventory drafted at the surface freeze (#7). → SPECS §The `Crawler` client.
- **#13 — CLOSED.** View mechanism: plain typed records + pure per-view read functions; decimal-string keys; **absent view throws a typed error with `world.hasView(name)` as the capability query, record-miss stays `undefined`**; no per-view subpath exports in v1, but the world JSON layout stays able to split per view later. → SPECS §Worlds & Views.
- **#15 — CLOSED.** Worlds ship the **original token SVGs** (display-only) inline, as the **`TokenSvg`** view — sync access, own view so the per-view split escape hatch stays clean (sizes accepted: EC ~1MB; `cnc` ~9,000 × ~4KB ≈ 36MB). **Nothing playable is stored, and no playable transform ships in v1** — consumers (explorer included) route the original SVG; ec-dapp already owns the original→playable conversion and it migrates into the SDK at P10. Rejected: lazy chunked loading (async machinery not worth it at these sizes); storing a converted playable form; building a v1 `playableSvg()` transform (redundant with ec-dapp's existing converter). → SPECS §Worlds & Views, Token SVGs.
- **#6 — CLOSED.** The committed mainnet/goerli world JSON is **migrated once, by a one-off script, to the settled World shape** (WorldInfo view, readable strings, `doors[]`, decimal keys, canonical serializer) before/with P2 — core only ever knows one shape, and the script's derivations (NEWS door math, enum→string maps) seed the P5 converter. Rejected: a load-time adapter (throwaway legacy-shape code in core for four phases). The migration cannot add `TokenSvg` (no cache yet) — views are optional per world, so that view first appears with the P6 builder. The builder re-emits the same shape from cache.
- **#2 — CLOSED.** `TokenCoord` stays a **first-class stored view** — worlds store the placement relation and `ChamberData` side by side (the provenance model); derive-at-load rejected. → SPECS §Worlds & Views.
- **#5 — CLOSED.** `luw` is scrapped, not deferred; how a *new* schema enters folded into #8 (also closed).
- **#8 — CLOSED.** Schema-abstraction depth: resolved by the `ChamberSchema`/`CoordinateSchema` split + the name→library registry; type level schema-parameterized; literal-union lookup names. → SPECS §Schemas + §Type-system rules.
- **#10 — CLOSED.** One subpath export per world; the root ships no world JSON; `createCrawler([worlds])` is fully sync. → SPECS §Package map. Residuals delegated: per-view granularity → resolved in #13 (none in v1); remote/URL loading → not v1 (a CORS-opted explorer deployment, #18).
- **#11 — CLOSED.** The canonical serializer `formatViewData` lives in **`crawler-api`** and must not be removed from there; every views-data create/update goes through it; no `BigInt.prototype.toJSON` monkeypatch. It is the api's one deliberate exception to "pure contract interface". Rejected: moving it to `crawler-data` (or core) — npm deps are package-wide, so prettier would ride into the zero-dep packages every minimal consumer installs, yet nothing in them serializes at runtime (`world.import` merges in memory); serialization only ever happens beside on-chain fetching (builder/cache/migration), i.e. where `crawler-api` is already present. → SPECS §Canonical serialization.
- **#18 — CLOSED.** Explorer API shape: same-origin data routes + converted on-chain routes; token SVGs for visual browsing. → SPECS §`apps/sdk-explorer`.
- **#19 — CLOSED.** Full `ChamberData` field classification (normalized core vs `ec` attributes vs dropped stored fields). → SPECS §`ChamberData<Schema>`. Residual: the `isDynamic` count/query surface (`getStaticChamberCount`, `getDynamicChambersCoords`, …) is enumerated at the surface freeze (#7).
- **#21 — CLOSED.** Cache payload & converter input: a **single, contract-agnostic** `cache` package holds a **pure `tokenURI` archive** — per token exactly `<tokenId>.json` (blob fields extracted) + `<tokenId>.svg`, one dir per world (`cache/data/<dataDir>`, `dataDir` incl. the deployment — `network` alone collides), plus a per-`dataDir` `_cache.json` provenance/state file (binding echo + per-token `block` + `fetchedThroughBlock` watermark). A lean `worlds.json` (world `name` → `{ dataDir, rpcEnv }`) sets coverage; the contract binding comes from the `crawler-data` world, never restated. Fetch is **missing-only**, block-pinned, idempotent (retry 3×/1 s then abort non-zero); no struct calls, no fetch-list manifest. Staleness/neighbour refetch is a schema-level core policy, **empty for now** and designed with real-time updates (#16 — the blanket `#Locked` refetch was dropped as too broad for EC's boundary). The converter's input is the schema's **token payload** (cached tokenURI data + optional `onchain` supplement); the `ec` converter **parses the SVG back into the tilemap**; on-chain-only fields (`ec`: `seed`) are fetched via `crawler-api` **by the payload assembler** (builder / live source), never by the converter — purity and `crawler-data`'s zero-runtime-dep rule stand. Rejected: caching the `coordToChamberData` struct (redundant — the SVG encodes the map; the archive stays pure tokenURI); fetching inside converters. → SPECS §Data pipeline.
- **#22 — CLOSED.** Build coverage: cache + builder cover **mainnet only**. Goerli's chain is dead (no RPC) — its world exists solely via the P2 migration, stays frozen, never gains `TokenSvg`, still ships as a subpath export. Sepolia is added when a deployment exists. Rejected: reverse-building a goerli cache from migrated JSON (no SVGs recoverable; the cache stops being a true snapshot). → SPECS §Data pipeline.
- **#20 — CLOSED.** The P3 api surface is confirmed (→ SPECS §`crawler-api`, illustrative code included): the api unpacks `tokenURI` data-URIs (decoding is parsing, not converting — the cache and live watcher both need it); standard ERC-20/ERC-721 ABIs ship bundled (callers supply only an address); **`getCardsContract()`** joins as a known non-chamber contract (Cards are part of EndlessCrawler; games want them); factory names ride the surface freeze (#7).

---

## Out of scope

- New views / new game features. (`crawler-api` is **not** out of scope — it gets a complete P3 refactor, see its section — plus new surface: the live watcher, owner helpers + delegate.xyz, #16/#17.)
- **Not** out of scope: the `cnc` **cache + converter ship in v1** — "the perfect case for supporting different worlds." Consequence: decision #14 (cnc coordinate mapping) is a **v1 blocker** (the converter can't emit coord-keyed `ChamberData` without it), and #8's schema seam gets exercised for real. (`luw` is deleted, not deferred.)

---

## Relationship to V2_PLAN.md

- **V2 first, publish last.** V2 modernizes the stack (tooling, TS, packaging, Vitest) but **does not publish**. This refactor reshapes the API, and the finished API is what gets published (P9).
- **No back-compat to preserve.** Nothing is on npm, so there are no external consumers. In-repo consumers (`crawler-react`, `apps/sdk-explorer`) and sibling `ec-dapp` link the workspace and migrate in lockstep — break freely, fix consumers in the same change.
- **Same discipline.** Decision markers, phase gates, green-at-each-step — keep the V2 plan's rigor.
- **Reconcile back into V2 (flagged, not yet applied):**
  - _Serializer:_ resolved — `formatViewData` lives in `crawler-api` with prettier as a runtime dep (decision #11). No V2 edit needed.
  - _Docs:_ V2 doesn't mention `apps/docs`/vocs; the documented-surface spec (decision #12) is new here. No V2 change needed, but V2's packaging work (correct `exports`/types) is a prerequisite for Twoslash to resolve the published types.

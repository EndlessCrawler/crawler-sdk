# crawler-sdk — SDK Refactor Plan

**Status:** _Draft / idea-capture._ Not started. This refactor runs **after** the V2 modernization (`specs/V2_PLAN.md`) lands its stack work, but **before anything is published to npm** — the V2 packages are *not* published; the first publish happens only once this refactor is done. V2 makes the stack modern and correct; this plan makes the *API* the one we actually want, and that shipped API is what goes to npm.

**No back-compatibility constraint.** Because nothing is published yet, there are no external consumers to preserve. Break APIs freely between steps. The only in-repo consumers (`crawler-react`, `apps/sdk-explorer`) and the sibling `ec-dapp` all link the workspace and move in lockstep with us.

This is a **living document** to compile ideas and specifications. **Working model:** the user throws ideas and specs (via the **`/sdk-plan`** project command — `.claude/commands/sdk-plan.md`); Claude fits them into this doc and keeps it organized, and **asks when an idea conflicts with the current implementation or is internally inconsistent** rather than silently reconciling it. All state lives in this file and its sibling — the conversation is disposable, so a fresh clone + `/sdk-plan` resumes the work seamlessly. Sections marked **OPEN** are unresolved — fill them in as the direction firms up. Sections marked **DECIDED** are settled. The doc states **current facts only** — no dates, changelog narration, or supersession trails; when something settles or changes, its entry is rewritten to the outcome (git history carries the chronology).

**Two documents:** this file (`SDK_PLAN.md`) is the **brainstorm** — ideas, requirements, decisions in progress, open questions. **`specs/SDK_SPECS.md`** is the **final specification**, built incrementally: as decisions settle here, their final form **migrates there**. Provisional material never goes in SPECS; settled material shouldn't linger only here.

---

## What this SDK is — DECIDED

**This is a game *level-generation / level-data* SDK and tool — not a game, and not tied to one game.** It reads, interprets, and (when building datasets) canonically serializes generated dungeon/level data, across **whatever schema** a given game or generator produces. "Endless Crawler" is the name of the repo's heritage and its `classic` schema; it is *not* the scope.

- **Schemas = level-data formats from different games/generators.** `classic` (Endless Crawler's 16×16 packed-coord chambers) is the only real one today. The first *different* schema will be **`c&c` — Crypts & Caverns**.
- **`luw` (Loot Underworld) is dead.** It was a never-finished dataset kept as a placeholder; it will almost certainly never ship. **Scrap it everywhere** — code, types, tests, and this plan. It is *not* the future-schema example; `c&c` is.
- **Primary consumer: `ec-dapp` (Endless Crawler).** Design ergonomics and the published surface around a reader like ec-dapp first; keep everything else game-agnostic.

## Why refactor at all

The V2 plan already names the core wart in its "Out of scope" note: the SDK keeps its dataset state in a **process-global mutable singleton** (`window.CrawlerModules` / `global.CrawlerModules`, `modules/importer.ts`). That one decision radiates outward into most of what makes the current API awkward. The minimal thing we actually want is small and clear:

> **Multiple data sets, and one TypeScript library to read and interpret them — types included.**

Everything below is in service of that sentence, for level data of *any* schema.

---

## Direction — DECIDED

Three shaping decisions, chosen up front so the rest of the plan has a spine:

1. **API paradigm — functional core + thin wrapper.** Pure functions over plain, typed `DataSet` values are the *real* API (`getChamber(ds, coord)`, `coordToSlug(coord)`). A small optional wrapper composes those functions for ergonomics and for React; the functions never depend on the wrapper, the wrapper only ever delegates. **The wrapper's *shape* — per-dataset handle, multi-dataset container, or none — is OPEN (decision #9)**, forced open by the future cross-dataset-jump requirement.
2. **Variation axis — `schema`, not "game".** The SDK is schema-agnostic (see [What this SDK is](#what-this-sdk-is--decided)). Today only the **`classic`** schema has data; **`c&c` (Crypts & Caverns)** is the first planned *different* schema — its **cache + converter ship in v1**, so the seam is exercised for real (see Data pipeline / Out of scope). **Scrap `luw` entirely** — dead placeholder code, not a future extension. Build for one real schema now (`classic`) while treating schema as the clean seam for `c&c` and beyond. **How much of the schema abstraction to build up front is OPEN — see decision #8.**
3. **Refactor approach — incremental, in-place.** Evolve `crawler-core` module-by-module, tests green at each step. No parallel greenfield package. Each stage is independently shippable, mirroring the V2 phase discipline.

These interact: having exactly **one live schema** (`classic`, once `luw` is deleted) is what *makes* the incremental in-place path tractable — most of the complexity being removed (namespaces, the `ModuleInterface`, the generic Compass) exists only to keep a second, never-shipped game generic. The schema concept lets us *name and validate* variation as data without re-building that machinery until `c&c` actually needs it (decision #8).

---

## Core concept: dataset schemas

Not every dataset describes the same kind of level. The core/genesis datasets — **mainnet, goerli, and soon sepolia** — all share one specification: **16×16 chambers, one coordinate system, one attribute set, one metadata shape, one set of data types.** Other datasets need not: one could be 32×32, another could vary sizes, another could use a different coordinate system entirely. The first real example is **`c&c` (Crypts & Caverns)** — a different game's generated dungeons, with its own grid dimensions and coordinate model.

To model this, a dataset declares the **schema** it conforms to, and a schema is a named specification of:

- **chamber size** — fixed for every chamber (`classic`: `{ width: 16, height: 16 }`) or **per-chamber** (`c&c`: no schema-wide size; each chamber carries its own);
- **coordinate schema** — the coordinate system *and its full navigation library* (**NEWS** for `classic`; `c&c` defines its own — see the split below);
- **core-property value domains** — e.g. the schema's **Terrain set** (terrain is a core property on every chamber; its *values* vary per schema — see Worlds & Views);
- **attribute set** (which schema-local per-chamber attributes exist);
- **metadata shape**;
- **data types** of the above.

### The schema splits in two: `ChamberSchema` + `CoordinateSchema` — DECIDED direction

A world defines both halves of its schema:

- **`ChamberSchema`** — the chamber-payload spec: size policy, terrain domain, attribute set (the descriptor drafted below).
- **`CoordinateSchema`** — the coordinate system **and the full library of functions to navigate that world**. `classic`'s is **NEWS** (North, East, West, South) — uniquely designed for EC: every chamber has **4 doors, one per edge**, doors keep being unlocked and chambers minted **virtually forever**, so navigation is trivially 4 doors → 4 directions → 4 destination coords. Other schemas (`c&c`) don't share that perfect grid and define their own.

Rules that follow:

- **`Dir`, `offsetCoord`, compass/slug math are NEWS functions** — they belong to the NEWS `CoordinateSchema` library, **not the standard client**. A world exposes its own library (`world.coords` in the strawman).
- **Converters use the `CoordinateSchema` at build time** to compute each door's destination coordinate.
- **Self-sufficiency invariant — DECIDED:** `ChamberData` carries **everything a game needs to navigate chamber-to-chamber** (doors with `destCoord` — see Worlds & Views) **without ever calling the `CoordinateSchema` library**. This invariant is what keeps the standard client schema-agnostic.
- **CoordinateSchemas are reusable — DECIDED.** A new, different world with its own `ChamberSchema` can adopt **NEWS** (or any existing coordinate schema) — that is exactly *why* chamber and coordinate schemas are separate schemas.
- **Home — DECIDED: chamber schemas, coordinate schemas, and their libraries all live in `crawler-core`.**

Core datasets conform to the **`classic`** schema. New schemas are how new games' level formats — starting with **`c&c` (Crypts & Caverns)** — enter later. (Grounding for "variable" size: C&C dungeons carry a per-token `size` in their metadata, e.g. `20x20`.)

**The schema attaches to `ChamberData` — DECIDED.** A world is *defined by the schema of its `ChamberData`* — the schema governs the chamber payload's shape and its coordinate system. The other views (`TokenCoord`; `TokenOwner` if it stays a view, #17) are schema-generic `BigIntish` maps (see [Worlds & Views](#core-concept-worlds--views--decided)). Note: **`c&c` has no native coordinates** — interim rule `coord = chamber ID`, real coordinate mapping to be spec'd (decision #14).

**Naming — DECIDED: `schema`.** A dataset references a named schema (`dataset.schema = 'classic'`); the specification itself is a `DataSchema`. Chosen over "layout" specifically because **"layout" is already taken** — a chamber's internal tile arrangement is its `tilemap`/`bitmap` (the *chamber layout*), and overloading the word would be a permanent source of confusion. "Schema" keeps the two levels distinct: a **schema** governs a whole dataset; a **tilemap** is one chamber's interior.

**This replaces the `moduleId` axis.** Where the current code keys everything on `ModuleId` ('ec' | 'luw'), the target keys on schema. `classic` ≈ today's `ec`; **`luw` is deleted** (dead placeholder); `c&c` is the first schema that will actually exercise the multi-schema seam.

**How much abstraction to build now is OPEN — see [decision #8](#open-decisions--grouped-by-implementation-phase).** The two live options: (a) datasets merely *tag* their schema and we validate/reject unsupported ones while shipping only the `classic` interpreter; or (b) the interpretation logic (coordinate math, attribute decoding) is *parameterized by schema* from day one so new schemas plug in without core edits.

### Schema shape — strawman (illustrative, to react to)

**Pure type vs value object — answered: both, from one source.** A schema must exist at **runtime as a plain descriptor object** — TS types are erased at runtime, and load-time validation (#10/#13), per-chamber-size defaulting, and terrain-domain checks all need *values*. The **type level is then derived from the descriptor** (`as const satisfies DataSchema`), so there's a single source of truth — and the descriptor doubles as the **visually-checkable spec** you asked for:

```ts
// crawler-core ships the built-in schema descriptors — plain, readable objects:
const classic = {
  name: 'classic',
  size: { width: 16, height: 16 },          // fixed → chambers do NOT carry a size
  terrains: ['earth', 'water', 'air', 'fire'], // Terrain value domain — readable strings
  coordinateSchema: 'news',                 // names the CoordinateSchema (navigation library — see the split above)
  views: ['tokenCoord', 'chamberData'],     // views that CAN exist (optional per world)
  attributes: {                             // schema-local gameplay extras, string-valued
    gemType: ['silver', 'gold', 'sapphire', 'emerald', 'ruby', 'diamond', 'ethernite', 'kao'],
    gemPos: 'tile',
    coins: 'number',
    worth: 'number',
  },
} as const satisfies DataSchema;

const cnc = {
  name: 'c&c',
  size: 'per-chamber',                      // no schema-wide size → every ChamberData carries { width, height }
  terrains: ['desert oasis', 'stone temple', 'forest ruins', 'mountain deep', 'underwater keep', "ember's glow"],
  coordinateSchema: 'chamber-id',           // interim rule until #14 lands
  views: ['tokenCoord', 'chamberData'],
  attributes: {
    affinity: 'string',
    legendary: 'boolean',
    structure: ['crypt', 'cavern'],
    pointsOfInterest: 'number',
  },
} as const satisfies DataSchema;

// The type level DERIVES from the value level — no duplication:
type ClassicTerrain = (typeof classic)['terrains'][number]; // 'earth' | 'water' | 'air' | 'fire'
type CoordinateSchemaName = 'news' | 'chamber-id';          // every lookup name is a literal union — never bare string
// ChamberData<typeof classic> = normalized core (terrain: ClassicTerrain, no size field)
//                               + attributes { gemType, gemPos, coins, worth }
// ChamberData<typeof cnc>     = normalized core (terrain: CncTerrain, size: {width,height})
//                               + attributes { affinity, legendary, structure, pointsOfInterest }
```

**Access (strawman):** core exports the descriptors (e.g. `schemas.classic`); a `World` references its schema **by name**, `loadWorld` resolves the descriptor and validates the JSON against it, and the `Crawler`/handle resolves the schema *from the world* — consumers rarely pass it explicitly; schema-aware functions (coordinate math, size defaulting, terrain checks) receive it via the world.

**World fields vs schema fields — the boundary:** `name`, `network`, `chainId`, `contract` are **World** fields, not schema fields — mainnet/goerli/sepolia all conform to `classic` while differing in every one of those (the settled chains/schema orthogonality). A schema carries only what is **shared by every world conforming to it**. And rather than two schema kinds (a "WorldSchema" + "ChamberSchemas"), one descriptor covers both levels _(lean)_: world-wide constants (size policy, terrain domain, view set, coord system) plus the chamber-payload spec — with per-chamber `size` appearing in `ChamberData` exactly when the schema says `per-chamber`.

---

## Core concept: Worlds & Views — DECIDED

### `World` — the dataset

**A dataset is called a `World`.** mainnet, goerli, sepolia are worlds; a Crypts & Caverns world (schema `c&c`) comes later. **Naming note:** the *implementation's* `DataSet` is what is now called **World** — current-state descriptions in this doc and the code still say `DataSet`; the target name for that concept is `World`. (Side effect: this cements rejecting `world` as the entry-point name in decision #9 — the word is taken.)

### Views — a world's basic data is a set of Views

The **View** concept is kept — but the current implementation of how a view is built and loaded is **rejected**: the class-per-view `ViewAccess` machinery (`views/view.tokenIdToCoord.ts:27`), the `any`-typed `ViewValue`/`ViewRecords` (`views/view.ts:57–66`), the `Options` threading and per-record `set()` + events are exactly diagnoses #2/#3/#4. The replacement is designed under the functional-core direction — mechanism OPEN, **decision #13**.

A View is one **named, typed keyed map** inside a world. The two settled basic `classic` views:

| View | Key | Value | Notes |
|---|---|---|---|
| **`TokenCoord`** _(implementation still says `tokenIdToCoord`)_ | chamber/token ID (`BigIntish`) | coord (`BigIntish`) | First-class stored view (decision #2 — CLOSED). **The placement relation:** an entry here is what *spawns* a chamber into the playable world (see Placement & spawning below). |
| **`ChamberData`** | coord (`BigIntish`) | `Chamber` (typed record) | The data used to create the game world; *derived* from cached token metadata + SVG by the builder's converters (see [Data pipeline](#data-pipeline-caches-converters-builder-live-chambers--decided-direction)). |

> **`ChamberMetadata` is not a basic view.** Raw token metadata lives as **individual files in the `cache/*` layer** at build time and is **transient** in the live path (the converter consumes it right after fetch); worlds don't carry it. Views remain open-ended, so it can return if a use case appears. (The commented-out `tokenUri` stub at `views/view.ts:16` anticipated such a view.)

> **Ownership (`TokenOwner`) — OPEN (#17).** Ownership is **dynamic** (a token can be transferred, or *delegated* to another player), so a static world view is stale by nature — it may not be a view at all but a runtime `crawler-api` concern (the usual need is just the *connected player's* chambers). See [Ownership & delegation](#ownership--delegation--spec-mechanism-open-17) and decision #17. Naming _(lean)_: **`TokenOwner`**, consistent with `TokenCoord`.

- **Placement & spawning — DECIDED.** A world can contain many `ChamberData` records, but **only chambers with a relation in `TokenCoord` are spawned in the world and playable** — a chamber must be *placed* in the world with a coordinate to exist as part of the playable world. The spawned set is the chambers whose coord is referenced by a `TokenCoord` entry.
- **`ChamberData` is keyed by coord — DECIDED.** Decided over keying by chamber ID: the ID isn't game-relevant — gameplay computes the *next* chamber's coord from the current one (neighbor math) and jumps to it, so coord is the natural lookup key. (Today's implementation already keys by coord — `views/view.chamberData.ts:81`.) For schemas without native coordinates, see the `c&c` note below.
- **A world is defined by the schema of its `ChamberData` — DECIDED.** The schema attaches to the chamber payload: it governs `ChamberData`'s shape and the coordinate system. The other views (`TokenCoord`; `TokenOwner` if it stays a view, #17) are schema-generic `BigIntish` maps.
- **`ChamberData` = normalized core + per-schema `attributes` — DECIDED.** The converter output has two parts: a **normalized, game-facing core** — everything needed to *build* the chamber: name, terrain, tilemap, doors (lock and entry state marked per door), seed, yonder, compass (stored where the `CoordinateSchema` has one, so data-only consumers get readable positions), and (in per-chamber-size schemas) size — structurally identical across schemas, so a game can consume any world; and an **`attributes` section typed by the schema** (EndlessCrawler has gems and coins; C&C has its own). This is what `ChamberData<Schema>` means concretely: the generic parameter types the terrain domain and the `attributes`.
- **Attributes — DECIDED.** Attributes are the **schema-local gameplay extras**: `Gem`/`Hoard` in `classic` (`crawler/constants.ts:95`); `affinity`, `legendary`, `structure`, `points of interest` in `c&c` (from its token metadata's OpenSea-style `attributes` array). Each schema declares its own set. **Anything used to build a chamber's topology is a core property, never an attribute** — size, terrain, yonder, seed, doors, tilemap.
- **`Terrain` is a core property, not an attribute — DECIDED.** Every chamber needs a terrain to be built, so `terrain` lives in the normalized core; what varies per schema is its **value domain**, declared by the schema: `classic` — earth/water/air/fire (`crawler/constants.ts:63`); `c&c` — its environments (stone temple, desert oasis, …).
- **Readable string values — DECIDED.** Terrain and attribute values (e.g. `gemType`) are stored as **strings**, not numeric enums — today's numeric JSON (`gemType` in `crawler-data/src/data/mainnet/chamberData.json`) is unreadable. The string form arrives with the builder regeneration (rides decision #6); the schema descriptor declares each domain's string set.
- **`bitmap` dropped from `ChamberData` — DECIDED.** It's a 256-bit `BigIntish` that fits exactly a 16×16 map — it can't cover larger `c&c` chambers, and it's fully derivable from `tilemap`. Removed from the stored record; if a game needs it, core adds a derive function (`Bitmap.toBitmap` already exists — `crawler/bitmap.ts:102`).
- **Doors carry destinations — DECIDED.** A `Door` element in `ChamberData.doors` is **`{ tile, destCoord, direction?, isLocked?, isEntry? }`** — its tile, the **destination coordinate** it leads to, an *optional* direction (aesthetic, for map-building only), **`isLocked?`** (`undefined` = unlocked — replaces the parallel `locks: boolean[]` array), and **`isEntry?`** (marks the chamber's entry door — replaces `ChamberData.entryDir`). A chamber has many doors; **games just need to know where they lead**. Navigation helper: `getDoorsTo(dir)` returns the doors pointing a given way — an *array*, since other schemas can have multiple doors per direction. The converter computes `destCoord` at build time using the schema's `CoordinateSchema`; this is what makes the **self-sufficiency invariant** hold (see the schema split). Cross-world doors later world-qualify `destCoord` (see Data model).
- **Converter binding & import ergonomics.** An imported world carries its schema, and the schema binds its converter — so importing a live chamber is one call *in the world's context*, e.g. `world.import(tokenId, metadata)` ("or something like that"), which resolves the right converter by itself. Notes: a *bare* function can't be named `import` (reserved word) — fine as a method on a world handle, a free function needs e.g. `importChamber(world, …)`; this is a concrete argument for the per-world **handle** (decision #9a); and it's the live-merge entry point — mutate vs. return-a-new-world is decision #1/#16's pure-merge question.
- **⚠️ `c&c` has no native coordinates.** Interim rule: `coord = chamber ID`; the `c&c` importer must map/derive real coordinates — **to be spec'd (OPEN, decision #14)**.
- **View set is optional per world — DECIDED.** The schema defines which views *can* exist; each world carries the views it *has*. Existing mainnet/goerli JSON (two views) stays valid; the build path adds whatever further views exist when a world is (re)generated. Readers must handle an absent view. (For very large worlds, per-view subpath granularity remains an option — see #13.)
- **The world's own info is a view — DECIDED direction.** The world-level block (name, network, chainId, contract, schema name) is **stored as a view** inside the world (working name **`WorldInfo`**), so a world is *uniformly a set of views*: one load/serialize path for everything. The `World` *type* still exposes these fields directly; the view is where they're **stored**. Caveat for #13's mechanism: it's a **singleton record**, not a keyed map — the view model must admit metadata-shaped views (or a map with one well-known key). Supersedes today's per-view `metadata` duplication.
- **Provenance is part of the model.** Views are deliberately *not* normalized: `TokenCoord` (the on-chain placement relation) and `ChamberData` (derived from cached token metadata by the builder) are stored side by side rather than one being derived from the other at load time (decision #2 — CLOSED).

---

## Core data type: `BigIntish` — DECIDED

**`BigIntish`** is a core data type: a value that *is* a `bigint` but may be represented as a `bigint`, a `number`, a decimal string, or a hex string `` `0x${string}` `` — and is **always translatable to a `bigint`**. View keys, coords, token IDs, and wallet addresses are all `BigIntish`.

- **Home — DECIDED: a dedicated, self-contained, fully-tested module inside `crawler-core`** (e.g. `src/bigintish/` — types, conversions, guards, exhaustive unit tests). Chosen over a separate `@avante/bigintish` package (no fifth package to version/publish). Whether it *also* gets a subpath export (`@avante/crawler-core/bigintish`, like the existing `./internal`) is a detail for the surface freeze (#7).
- **Spelling: `BigIntish`** — today's code spells it `BigIntIsh` (`types/types.ts:19`).
- **What exists today, scattered:** the type at `types/types.ts:19`; conversions in `utils/bigint.ts` (`toBigInt`, `bigIntToHex`, `bigIntToByteArray`, …); `isBigInt` in `utils/misc.ts`. The new module consolidates these.
- **`HexString` is `` `0x${string}` `` — DECIDED.** Today `HexString = string` and `BigIntString = string` (`types/types.ts:9–13`), deliberately loosened with the comment "not good for view types when converting from json" — so the current `BigIntIsh` degenerates to `bigint | number | string`. The target uses the strict template-literal type; the JSON concern is answered by **load-time validation** (`loadWorld` parses/validates raw JSON into typed values), not by weakening the type.
- **Warts the new module must fix:** `toBigInt` is a bare `BigInt(value)` (`utils/bigint.ts:8`) — throws on garbage, silently accepts `''` as `0n`; `bigIntEquals` guards only `a` and uses loose `==` (`utils/bigint.ts:11–12`). Target: pure, total functions with explicit guards (`isBigIntish`, `isHexString`) and defined error behavior.
- **Addresses become `BigIntish`.** Today `Address = string` (`types/types.ts:16`); per the views spec, a wallet address (e.g. owner values, #17) is a `BigIntish`. Nice property: equality via `bigint` comparison sidesteps case/checksum mismatches; rendering back to (checksummed) hex is a display concern.
- **Fully tested is part of the spec:** all four representations, round-trips, edge cases (0, negatives, >64-bit values, odd-length hex, malformed strings).

---

## Data pipeline: caches, converters, builder, live chambers — DECIDED direction

### Provenance: a Chamber always comes from a token contract — DECIDED

A `Chamber` is always defined from an **on-chain ERC-721 token smart contract**, on a specific **network** (ethereum / base / starknet) and **chain id** (mainnet / sepolia). A **World is bound to a token contract** — `{ network, chainId, contract }` — whose token metadata is parsed into the world's schema. EndlessCrawler (`classic`) and Crypts & Caverns (`c&c`) are both on **Ethereum**. Consequence for the chain model: today's `ChainId` (`views/chains.ts`, EVM-numeric 1/5) lacks the **network axis**. **Chain-id type — DECIDED: `BigIntish`.** Starknet ids are `BigIntish`-native; EVM ids are numbers, which `BigIntish` already covers — convert with `Number()` at the EVM boundary.

### The pipeline — on-chain token → cache → world

1. **Cache packages — one per world contract.** New workspace packages `cache/endless-crawler` and `cache/cryptsandcaverns` (more added per new world) fetch **each existing token** via `crawler-api` and store its **JSON metadata and decoded SVG image individually as files**. Cache projects only *read on-chain data (using the api) and store files* — no game logic. **Private:** never published; they live under `cache/` (not `packages/`) precisely so they never leave the repo, used only internally at build time. Cache files are committed, so builds are reproducible and fetching is incremental.
2. **Converters — per-schema pure functions, served from `crawler-data` — DECIDED.** A converter translates token metadata + SVG → **`ChamberData<Schema>`**: strings in, typed values out, **no fetching inside**, normalized signatures, types from the SDK. Two initially — EndlessCrawler and C&C — each acting over one cache. **Naming — settled: `converter`** (rejected "adapter": implies interface-wrapping, the GoF pattern — these are pure data transformations). **Dependency rule — DECIDED:** `crawler-api` is the **single source of truth to fetch** data; `crawler-data` is the **single place to convert** data per schema. `crawler-data` may use `crawler-api` in its **build script only** (a `devDependency`); it gains **no runtime dependency** (stays viem-free), and `crawler-api` never depends on `crawler-data`.
3. **Builder — module in `crawler-data`.** Reads the caches, converts JSON + SVG into `ChamberData` via the converters, and assembles world JSON through the canonical serializer (#11). The **original metadata is not shipped** in `crawler-data` (worlds don't carry raw metadata — see Worlds & Views). **TBD — OPEN (#15):** also ship the SVG *converted into a playable form* by the builder — it's used as the bare-bones playable demo game in EndlessCrawler.
4. **Live watcher — optional module in `crawler-api`.** Watches on-chain activity and fetches newly minted tokens not yet included in `crawler-data`, so a game using the SDK can use **new chambers in real-time**. RPC is always **game-supplied or a public one — never our RPC** (matches the existing caller-supplied-RPC design, `lib/client.ts`). Games may opt out and use cached chambers only, with no real-time updates. The watcher yields **raw metadata**; the *caller* applies the converter — this keeps `crawler-api` from depending on `crawler-data`.
5. **Live-chamber persistence.** Live-fetched chambers can be stored in **browser localStorage** so a page refresh doesn't refetch. **Node-compat rule — DECIDED:** the `Crawler` client must not depend on a browser; the localStorage source ships in **`crawler-react` only**. Mechanics OPEN (#16).
6. **Publish cadence.** `crawler-data` is frequently updated and redeployed (daily or weekly) to fold newly minted chambers into the static worlds.

### Chamber sources — the Crawler resolves from three tiers — DECIDED direction

The `Crawler` client must be able to find and serve chamber data from, in priority order:

1. **`crawler-data`** — the static published worlds;
2. **localStorage** — previously live-fetched chambers (browser only, via `crawler-react`);
3. **on-chain** — live fetch through `crawler-api`.

Because `crawler-core` can import none of those packages, the `Crawler` accepts pluggable **chamber sources** injected by the consumer: statically imported worlds (decision #10) are tier 1, `crawler-react` ships the localStorage source, `crawler-api` ships the on-chain source — a source interface (name OPEN — `ChamberSource`?).

### Ownership & delegation — spec; mechanism OPEN (#17)

- **Owner helpers are served from `crawler-api`.** The usual need is narrow: **the connected player's chambers** — not a full ownership table.
- **Constraint: no indexers, no token enumerators.** Resolving a player's tokens must not depend on an off-chain indexer, and must not lean on `ERC721Enumerable` enumeration (`tokenOfOwnerByIndex` is one RPC call per token) — the mechanism must be RPC-frugal. **How, exactly, is OPEN (#17).**
- **Delegation via delegate.xyz — DECIDED as a requirement.** A connected player must be able to use tokens stored in a **different wallet** through [delegate.xyz](https://delegate.xyz). _(Not yet investigated — research the registry API/lookup cost before designing #17.)_
- **Is ownership a View at all? OPEN (#17).** Ownership is dynamic — tokens get transferred and delegated — so a static world view is stale by nature; it may live only as runtime api queries (possibly localStorage-cached like live chambers, #16).

---

## `apps/sdk-explorer` — browse tool & API provider — DECIDED direction

**What it is:** the SDK's own browsing tool — an app to **easily browse cached, parsed, and on-chain data** (the same three tiers the `Crawler` resolves from: static worlds in `crawler-data`, converted `ChamberData`, live on-chain reads).

- **Dogfooding rule — DECIDED.** The explorer **uses the same public APIs as any SDK consumer** — no internal imports, no privileged paths. (Already true today: it consumes only the four package roots — verified across the app.) This makes the explorer a living integration test of the published surface.
- **API-provider mode — DECIDED (shape closed, #18).** An explorer deployment exposes two **same-origin-by-default** route families: **data routes** (granular chamber lookups + whole-world payloads — same-origin guards the huge-payload risk) and **on-chain routes** (kept for **cached-vs-live compare/preview**, served **converted to `ChamberData`** — the explorer applies the converter server-side, keeping the api raw). CORS is opt-in per deployment (example use, local-network game) — which is also what would turn a deployment into #10's remote world source. Not a provider. A seed exists: `GET /api/read/...` and `GET /api/view/...` route handlers already serve on-chain reads with bigint-safe JSON (`api/read/[...read]/route.ts`, `api/view/[...view]/route.ts`; RPC registered server-side in `src/lib/serverRpc.ts`).
- **Visual browsing — DECIDED (#18): the token SVGs**, servable straight from the private `cache/*` (the explorer is in-repo; nothing needs publishing) — and, if #15 lands (leaning yes), the **playable SVG** as a chamber's public URL destination.
- **Current state (grounding):** the explorer is a JSON console, not yet a browser: `/data` catalogs the core client surface, `/apis` triggers on-chain reads, and results render as JSON in a Monaco panel (`components/DataMenu.tsx`, `ApisMenu.tsx`, `Results.tsx`). There is **no SVG or map rendering of any kind yet**. The app's selection state lives in `SelectionContext` (`src/hooks/SelectionContext.tsx` — `SelectionProvider`/`useSelection`).

---

## Concepts & naming — working glossary

The shared vocabulary. This is the "put the pieces together" reference — every concept, its current best name, and status (**settled** / **lean** / **OPEN**). Update as names firm up.

| Concept | Name (status) | What it is |
|---|---|---|
| **Entry point** — the one object that owns the registered worlds and cross-world traversal | **`Crawler`** _(lean)_ | The thing "it's all about"; what a consumer creates first. Rejected: **`client`** (collides with web3 RPC clients — viem, `crawler-api`), **`world`** (taken — it's the dataset's name). |
| **One map's data** — a big JSON blob conforming to a schema | **`World`** _(settled)_ | mainnet / goerli / sepolia are worlds. **Bound to an ERC-721 token contract** (`{ network, chainId, contract }`). **Note:** the implementation's `DataSet` is what is now called **World**; current-code references keep the old name. See [Worlds & Views](#core-concept-worlds--views--decided). |
| **The specification a dataset conforms to** | **`Schema`** _(settled name)_ | grid size, coordinate system, attribute set, metadata shape, data types. Named presets: **`classic`** (today's only real one), **`c&c`** (Crypts & Caverns, first planned). Replaces the `moduleId` axis. |
| **One named, typed keyed map inside a World** | **`View`** _(settled concept; mechanism OPEN #13)_ | Settled basic `classic` views: `TokenCoord` (implementation still says `tokenIdToCoord`), `ChamberData`. Optional per world. Current build/load design rejected. (`ChamberMetadata` lives in the cache layer; ownership-as-view OPEN #17.) |
| **Per-schema pure translator** — token metadata + SVG → `ChamberData<Schema>` | **`Converter`** _(settled — "adapter" rejected: implies interface-wrapping, these are pure data transforms)_ | Lives in `crawler-data`; no fetching inside. One per schema (EndlessCrawler, C&C — **both ship in v1**), each acting over one cache. Output = normalized core + schema-typed `attributes`. **Narrow by definition** — just metadata → `ChamberData`; coordinate interpretation lives in the `CoordinateSchema` library it uses at build time (door destinations). Bound to a world via its schema (`world.import(tokenId, metadata)`). |
| **Per-world on-chain snapshot** — token metadata + SVG stored as individual files | **`cache/*` packages** _(settled)_ | `cache/endless-crawler`, `cache/cryptsandcaverns`; fetch via `crawler-api`, write files, nothing else. **Private — never published**; under `cache/` so they never leave the repo. |
| **Pluggable chamber-data tier** the `Crawler` resolves from | _(name OPEN — `ChamberSource`?)_ | Priority: `crawler-data` → localStorage (react-only) → on-chain (api). Injected into the `Crawler`; core stays browser-free. |
| **A bigint in any representation** | **`BigIntish`** _(settled)_ | `bigint` / `number` / decimal string / `` `0x${string}` `` — always translatable to `bigint`. Dedicated fully-tested module in core. View keys, coords, token IDs, addresses are all `BigIntish`. |
| **A single room/node** in a dataset | **`Chamber`** _(lean)_ | Typed record; promotes today's `ChamberData`. |
| **The world's own info block**, stored as a view | **`WorldInfo`** _(working name; direction settled)_ | name, network, chainId, contract, schema ref — a **singleton view**, so worlds are uniformly sets of views (#13). |
| **A schema-local gameplay extra** on a chamber | **`Attribute`** _(settled concept)_ | Gem/Hoard (`classic`); affinity, legendary, structure, points of interest (`c&c`). Declared per schema, **string-valued**, typed by `ChamberData<Schema>`. **Terrain is not an attribute** — it's a core property. Field-mapping remnants OPEN (#19). |
| **A chamber's build material/biome** | **`Terrain`** _(settled: core property)_ | Required on every chamber to build it; **string-valued**; **value domain declared per schema** (`classic` earth/water/air/fire; `c&c` environments). |
| **Location, three representations** | **`Compass`** / **`Coord`** / **`Slug`** _(settled, existing)_ | Packed `bigint` / named-directions object / readable string. **`Slug` is the readable coordinate** — format defined by the `CoordinateSchema`, **never stored** (`chamber.slug()` computes it); **`Compass` may not exist** in a given `CoordinateSchema` (`chamber.compass()` → `undefined`) and **is stored** in `ChamberData` where it exists, so data-only consumers get readable positions. Conversions live in the `CoordinateSchema` library. |
| **The two halves of a schema** | **`ChamberSchema`** + **`CoordinateSchema`** _(settled direction)_ | A world defines both: the chamber-payload spec (size policy, terrain domain, attributes) and the coordinate system **with its full navigation library**. Both **live in core**; coordinate schemas are **reusable** across worlds. See the schema split. |
| **The first `CoordinateSchema`** — designed for EC, adoptable by any world | **`NEWS`** _(settled name)_ | North/East/West/South — 4 edge doors per chamber, endless minting. Its library (`Dir`, `offsetCoord`, compass/slug math) lives in core, reached via the world (`world.coords`), used chiefly by converters at build time. **Reusable** — other worlds may adopt it. |
| **A direction** | **`Dir`** _(existing — NEWS-specific)_ | N/E/W/S(+yonder) in `classic`'s NEWS `CoordinateSchema`; **not universal client API**. Optional/aesthetic on doors. |
| **A chamber's internal tile arrangement** | **`Tilemap`** / **`Bitmap`** _(existing)_ | The *chamber* layout — the reason "layout" is off-limits as a name elsewhere. |
| **A connection between chambers** | **`Door`** _(settled)_ | `{ tile, destCoord, direction?, isLocked?, isEntry? }` in `ChamberData.doors` (`isLocked` `undefined` = unlocked; `isEntry` marks the chamber's entry door); games navigate by `destCoord` (`getDoorsTo(dir)` → `Door[]`). Cross-world doors world-qualify the destination later (see Data model). |
| **Per-world accessor** bound to its schema | _(OPEN — folds into decision #9)_ | Either the `World` object carries methods, or it stays plain data read by functions. |
| **Canonical dataset serializer** — compact + human-readable JSON writer | **`formatViewData`** _(settled)_ | Lives in **`crawler-api`** (`src/lib/utils/formatter.ts`) — do not remove it from there. **Required for every views-data create/update.** The builder consumes it via crawler-data's build-script devDep on crawler-api. Refactor still owes: drop the `BigInt.prototype.toJSON` monkeypatch (local `bigint` handling instead). |
| **API reference website** | **`apps/docs`** (vocs) _(new)_ | vocs + Twoslash, built from the TSDoc on the exported surface. Sits alongside `apps/sdk-explorer`. See decision #12. |
| **The browse & API tool** — app to explore cached, parsed, and on-chain data | **`apps/sdk-explorer`** _(settled role)_ | Dogfoods the public SDK surface only (no internal imports). **API provider** (#18): same-origin data routes (chamber lookups + whole-world payloads) + converted on-chain routes for cached-vs-live compare; CORS opt-in. Visual browsing: token SVGs (+ playable SVG if #15 lands). |

---

## Package map — in `SDK_SPECS.md`

The package inventory (each package, what it provides, published name, dependency rules) lives in **`specs/SDK_SPECS.md`** — the final-specification document. Keep it updated as decisions land (e.g. #9 wrapper shape, #17 owner helpers).

---

## Diagnosis — what's wrong with the current design

Grounded in the current `crawler-core` source. These are the things the refactor must fix, roughly in priority order.

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
Every direction is optional (`north?`, `over?`, `domainId?`, …) so one interface can serve both games — so nothing is guaranteed present and every consumer null-checks. The `over?`/`under?`/`domainId?` fields exist only for the dead `luw`. A single-schema `classic` compass has exactly the fields that exist, all required. (When `c&c` lands, its compass is its own type, not a widened union — see decision #8.)

### 8. Browser-coupled event bus (`modules/events.ts`)
Events are dispatched as DOM `CustomEvent`s on `document` — a no-op in Node, subscribable only via raw `document.addEventListener` (which is what crawler-react's `useEvent` does, with a stale-closure risk from its empty dep array), and the payload is passed as the event *options* object instead of `{ detail }`, so it likely never reaches listeners. Whatever survives decision #1's events question must be environment-agnostic and typed.

---

## Current-surface audit — placements for what the plan didn't cover

Everything the current packages contain that the sections above don't already place. Each row: what exists today (grounded), and its suggested disposition — all _(lean)_ until confirmed; the two items too big for a lean are promoted to decisions #18/#19.

| What exists today | Suggested fit in the new SDK |
|---|---|
| **Game vocabulary enums** — `Dir`, `TileType`, `Terrain` (+`OppositeTerrain`), `Gem`/`Hoard`; `Gem.Coin === Gem.Count === 8` collision (`crawler/constants.ts`) | **DECIDED** (see Worlds & Views): `Terrain` → **core property**, string-valued, domain declared per schema; `Gem`/`Hoard` → `classic` **attributes**, string-valued. `Dir` and `TileType` are normalized-core topology vocabulary → stay in core _(lean)_. The numeric enums give way to schema-declared string domains (the `Gem` collision disappears with them). |
| **`Bitmap` namespace** — tilemap/bitmap pack/unpack (`toBitmap`, `toTilemap`, `findTilesInTilemap`), tile↔XY math, `flipDoorPosition`; 16×16 hardcoded; large dead commented block (`crawler/bitmap.ts`) | Keep in core as normalized-core topology helpers, typed + documented; grid size comes from the schema, not a constant; delete the dead code. Stored `ChamberData.bitmap` is **dropped** (derivable from `tilemap` — see Worlds & Views); these helpers remain as the derivation path. Feeds #15 (playable form). _(lean)_ |
| **Slug separators** — parse/emit with `,` default, also `''` `.` `;` `-` (`modules/modules.ts:43-45`; regex in `module.ec.ts:242`) | Part of the `classic` schema's slug spec: accept any separator on parse, emit the canonical default. Rides with decision #8. _(lean)_ |
| **`ContractName` enum in core** — ETH contract names in `views/chains.ts:34` (only `CrawlerToken` active; "move somewhere else" TODO) | Contract identity moves onto the World binding (`{ network, chainId, contract }`) and the api's artifact registry; core stays contract-free. _(lean)_ |
| **`Utils` grab-bag** — datetime formatters, `Math.random` helpers, lerp/clamp/deg-rad math, `minifyObject`, platform detection; `isString` tests for `bigint` (bug) (`utils/`) | Drop from the public surface (small-API principle): bigint fns are absorbed by `bigintish`; what core needs stays private; datetime/random/general math are consumer concerns. _(lean)_ |
| **Error classes** — seven, mostly global/module-machinery; `InvalidChainError` never thrown (`types/errors.ts`) | Machinery errors die with the machinery; design a small typed error set alongside the new surface (documented `@throws`, per the docs spec — `bigintish` already specs defined error behavior). _(lean)_ |
| **`transform()` build logic** — derives compass from coord, `entryDir` from the tilemap's Entry tile, `isDynamic` from lock count (`views/view.chamberData.ts:127`) | This *is* the embryonic EC **converter** — the logic migrates into `crawler-data`'s converter. The field mapping it feeds is decision #19. _(lean)_ |
| **On-chain view reads** — `readViewRecordOrThrow`/`readViewTotalCount` over `coordToChamberData`/`tokenIdToCoord` on `CrawlerToken`; args hardcoded `[0, key, true]` (chapter 0, generateMaps true); instantiates core clients internally (`crawler-api/lib/view.ts`, `lib/views/*`) | Becomes the **on-chain `ChamberSource`**. ⚠️ Tension with the pipeline rule: today the api converts records via the core module's `transform`; the rule says the api yields raw data and the *caller* converts — so the source gets its converter injected by the consumer (api still never depends on crawler-data). Un-hardcode `chapterNumber`/`generateMaps`. _(lean)_ |
| **Contract registry + dead artifacts** — `Contracts` registers only `CrawlerToken`; ~96 unreferenced Truffle artifacts in `contracts/crawler|cards`; ABI types are `any`; artifact carries a dead Ganache network `5777` (`lib/abis.ts`, `lib/contract.ts`) | Keep only live artifacts (CrawlerToken; C&C's contract when added); key lookups by the World's contract binding instead of name + numeric-chain tables; type the ABIs (viem `Abi`); delete the dead trees. _(lean)_ |
| **Silent Mainnet default** — reads with no `chainId` silently hit Mainnet (`lib/client.ts:65`) | With world-bound reads the chain comes from the world's contract binding; remove the silent default (explicit param or error). _(lean)_ |
| **Address utils** — `formatAddress`, `isSameAddress`, `isZeroAddress`, `validateAddress` (`lib/utils/utils.ts`) | Equality/zero checks become `BigIntish` comparisons; `formatAddress` (display shortening) is UI — explorer-side or dropped. _(lean)_ |
| **Per-view JSON `metadata`** — `{chainId, contractName, contractAddress, timestamp: 0}` duplicated in every view file, never stamped (`crawler-data/src/data/*`) | Superseded by the **`WorldInfo` view** (single world-level info block — see Worlds & Views); the builder stamps real timestamps. Folds into decision #6 (JSON migration). |
| **crawler-react scaffolding** — inert reducer (`SET_SOMETHING`, `chambers: []`), `dispatchChamberData` writing straight into the core global store, `useEvent` DOM bridge, `useConsole*`/`useEffectOnce` misc hooks (`context/CrawlerContext.tsx`, `hooks/`) | Delete with P8: the provider holds the `Crawler` container and hooks read it; misc hooks leave the public surface; reactivity comes from whatever replaces the event bus (#1, diagnosis #8). _(lean)_ |

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
- Off-chain cached data (`crawler-data`) loads unchanged, or with a mechanical shape migration.
- Events for dataset/view mutation, *if* mutation stays in scope (see OPEN below).

**Explicit non-goals here:** the existing on-chain read layer (`crawler-api`) — though this plan *adds* api surface (watcher, owner helpers) — and new game features. The `c&c` **cache + converter are v1 goals** (see Out of scope); `luw` is deleted, not deferred.

---

## Design principles (proposed — refine as we go)

- **Data is data.** A `World` (né `DataSet`) is a plain, serializable, deeply-typed value. Functions take it and return values; they don't hide it. Corollary: **a world JSON is fully usable *without* the SDK** — readable string values, stored `compass`, self-describing `WorldInfo` — which justifies storing a few derivable-but-readable fields.
- **No ambient state.** Nothing reads from a global. If a function needs a dataset, it's a parameter.
- **Pure by default.** Reads are pure. If mutation stays, it's confined and explicit (see OPEN).
- **Types are the spec.** The shape of `Chamber` / `DataSet` *is* the documentation. No `any` in public surface. **Every name used in lookups is a literal-union type** — `CoordinateSchemaName = 'news' | 'chamber-id'`, schema names, view names — never bare `string`.
- **Small public API.** Prefer a handful of well-named functions over a 40-method interface.
- **Minimal game = core + data.** Everything that deals directly with `ChamberData` lives in `crawler-core`. A game importing `crawler-core` + one world from `crawler-data` can be complete — client and all libraries needed to read chamber data; `crawler-api` (live real-time chambers) and `crawler-react` (web helpers) are strictly optional add-ons.
- **Thin wrapper, no logic.** Any handle/container wrapper (decision #9) composes the functional API; it never contains behavior the functions don't already expose.
- **No ambient selection.** No mutable "current dataset" in core — cross-dataset jumps can't express it and it re-creates the global-state smell.
- **Import only what you need.** Worlds are **big JSON files**; *don't import or load into memory what is not needed*. Mechanism (decision #10): **one subpath export per world** — `import mainnetData from '@avante/crawler-data/mainnet'` — so the import graph carries exactly the worlds a consumer uses, `createCrawler` is sync, and the root export ships no world JSON. (Consumers wanting runtime deferral can dynamic-`import()` the same subpaths — native code-splitting, no SDK machinery.) Hard constraint, not an optimization.
- **Canonical dataset serialization (hard constraint).** Datasets have a **custom JSON serializer that is both compact and human-readable** — arrays kept inline, structure legible, `bigint`s handled — so the on-disk JSON stays small and diff-reviewable. **Every dataset create/update must round-trip through it** so files are byte-stable across regenerations. Implemented by `formatViewData()` in **`crawler-api`** (`lib/utils/formatter.ts` — prettier-based, `printWidth: 80`, tabs), which stays there. The refactor still removes its `BigInt.prototype.toJSON` monkeypatch.
- **Documented public surface (spec).** Every exported API — functions, types, arguments, return values — carries complete **TSDoc** (`@param`, `@returns`, `@example`, `@remarks`/`@throws`), authored to be **vocs-compatible** so an API-reference site (new **`apps/docs`**) builds from it. Examples use vocs **Twoslash**, so they compile against the real types and can't silently drift. This makes "no `any`" and "types are the spec" load-bearing — weak types produce useless hover/reference docs. **An undocumented export is an incomplete export**; TSDoc is part of every phase's definition-of-done, not a final pass. (Note: today's comments use non-idiomatic `@type` JSDoc tags — redundant in TS; convert to proper TSDoc during the typing work.)
- **Native `bigint`, ESM, tree-shakeable** (inherited from V2: `sideEffects: false`, `exports` maps).

---

## Target API — strawman (illustrative, not final)

A sketch to react to, not a spec. Names and shapes are placeholders.

```ts
// ---- consumer view (a game): per-world imports, no await ----
import { createCrawler, Dir } from '@avante/crawler-core';
import mainnetData from '@avante/crawler-data/mainnet'; // one subpath export PER WORLD —
import goerliData from '@avante/crawler-data/goerli';   // the bundle contains only what you import

const crawler = createCrawler([mainnetData, goerliData]); // sync — the data is already in hand
// (optional live tiers — localStorage source, on-chain source — plug in via a sources option; those stay async by nature)

crawler.worlds();                               // ['mainnet', 'goerli'] — the registered world names
const mainnet = crawler.world('mainnet');       // sync — by name (from each world's WorldInfo)
const chamber = mainnet.getChamber(someCoord);  // sync, typed Chamber
chamber.world === mainnet;                      // runtime back-pointer to its world (never serialized)
chamber.slug();                                 // the READABLE coordinate — converted via the chamber's own CoordinateSchema
chamber.compass();                              // Compass | undefined — not every CoordinateSchema has a compass

// Navigation is DOOR-based — schema-agnostic, works for any world:
chamber.doors();                                // Door[] — all of this chamber's doors
const north = chamber.getDoorsTo(Dir.North);    // Door[] — a schema may have several doors per direction
const next = mainnet.getChamber(north[0].destCoord); // every door carries its destination

// NEWS-specific coordinate math is schema-bound — reached through the world, NOT the standard client:
mainnet.coords.offsetCoord(chamber.coord, Dir.North); // the NEWS CoordinateSchema, resolved from the world's schema
mainnet.coords.coordToSlug(chamber.coord);
```

Key shifts from today:
- **One subpath export per world, no await anywhere** — `@avante/crawler-data/mainnet` is its own entry: the import graph carries exactly the worlds you use, and `createCrawler` is **sync**. No descriptors in the public API; after creation, worlds go **by name** (`crawler.world('mainnet')`). Live on-chain fetches remain async by nature.
- **Handle methods over bare functions** (`world.getChamber(coord)`), delegating to the functional core underneath (Direction #1 unchanged: the wrapper only composes).
- **Navigation is door-based.** Games read where a door leads (`destCoord`); they never need offset math. `Dir`/`offsetCoord`/compass/slug are **NEWS** (`classic`'s coordinate system) — schema-bound via `world.coords`, and used chiefly by converters at build time.
- A `Chamber` carries a **runtime pointer to its world** — ergonomic convenience only; the *stored* record stays plain serializable data (no cycles in the JSON).
- No `Options` bag, no mutable "current dataset", no global; `Chamber` is a concrete type; keys and coords are `BigIntish`.

---

## Data model notes

- **Views:** today only `chamberData` and `tokenIdToCoord` exist (`views/view.ts`, `ViewName`). The target model is settled — see [Worlds & Views](#core-concept-worlds--views--decided): two settled basic `classic` views (`TokenCoord` and `ChamberData`), **optional per world**, deliberately un-normalized. `ChamberMetadata` lives in the cache layer and ownership-as-view is OPEN (#17). `TokenCoord` is a first-class view — decision #2 CLOSED; the replacement for today's `ViewAccess` build/load machinery is decision #13.
- **`Chamber` type:** promote today's `ChamberData` (`views/view.chamberData.ts`) to a first-class, fully-typed record; keep the Solidity-struct doc comment. Separate the *input model* (`ChamberDataModel`, used when building from chain data) from the *stored/read type* (`Chamber`) — that split is sound today and worth keeping. **Target shape:** a **normalized core** (name, terrain, tilemap, `Door[]` with per-door lock/entry state, seed, yonder, stored compass, `isDynamic?`, per-chamber size where the schema requires it — schema-independent structure, per-schema value domains) + a schema-typed **`attributes`** section; today's EC-specific fields (`chapter`, `gemPos`/`gemType`/`coins`/`worth`) move into `attributes`, gem types as strings; `bitmap` and stored `slug` are dropped (derivable). Full mapping: #19.
- **World shape:** today's `DataSet` is `{ moduleId, dataSetName, chainId, views }`. In the target it's a **`World`** — **`moduleId` is replaced by `schema`** (see [Core concept: dataset schemas](#core-concept-dataset-schemas)); `chainId` + name stay, joined by the **token-contract binding**: `network` (ethereum / base / starknet) and the ERC-721 `contract` address; `views` holds whichever of the schema's views this world carries (optional per world) — and the world-level fields themselves are *stored* as the **`WorldInfo` view** (see Worlds & Views). Core worlds carry `schema: 'classic'`. Whether the on-disk JSON in `crawler-data` needs a migration or can be adapted at load time is **OPEN** (nothing is published, so a migration is *allowed* — but adapt-at-load may still be less churn; see decision #6). Either way, the existing two-view mainnet/goerli JSON stays valid — the new views arrive only when a world is (re)generated.
- **Chains:** `views/chains.ts` (`ChainId` Blank/Mainnet/Goerli, + sepolia incoming). Goerli data stays (V2 decision: dead chain, valid cache). Note: `chainId` and `schema` are **orthogonal** — several chains (mainnet/goerli/sepolia) all share the `classic` schema. **New axis: `network`** — ethereum / base / starknet — sits above `chainId`, and the chains rework models `{ network, chainId }` together. **Chain-id type — DECIDED: `BigIntish`** — Starknet ids are `BigIntish`-native, EVM ids are plain numbers (already `BigIntish`-compatible), converted via `Number()` on the EVM side. EndlessCrawler and C&C are both Ethereum.
- **The canonical serializer (decision #11 — CLOSED).** `formatViewData` lives in **`crawler-api`** (`src/lib/utils/formatter.ts`, exported from the package root) and stays there. It is **required to format all views data** (every create/update); `crawler-data`'s builder reaches it through the build-script devDep on `crawler-api`. Prettier is a **runtime dependency of published `crawler-api`** (tighten at surface freeze #7 if the footprint matters). Standing fixes for the refactor: compact arrays + stable key order (`JSON.stringify(…, 2)` remains banned for datasets — it explodes door/lock/bitmap arrays one element per line), and the **global `BigInt.prototype.toJSON` monkeypatch** (`formatter.ts:17` — a module side effect in a package declaring `sideEffects: false`) is removed in favor of local `bigint` handling.
- **⚠️ Today's eager root barrel.** `crawler-data`'s **root barrel** eagerly exports every world — `mainnetDataSet`, `goerliDataSet`, `allDataSets` (`crawler-data/src/index.ts` → `data.ts`) — so importing anything pulls all the JSON. The fix (decision #10): **one subpath export per world** (`@avante/crawler-data/mainnet`), root exports no world JSON — consumers import exactly the worlds they use. Packaging note: per-world entries in `crawler-data`'s `exports` map (tsdown multi-entry or direct JSON entries).
- **Cross-world doors (future).** A chamber in world A will eventually connect to a chamber in world B. The **`Door` element is where the connection lives** (settled — see Worlds & Views): `destCoord` today; a cross-world door widens the destination to a **world-qualified** form (`{ world, coord }`). A same-world neighbor is the degenerate case. **OPEN:** how the destination world is identified in stored data. The `Crawler` container resolves cross-world traversal (decision #9).

---

## Implementation phases — broad-strokes checklist

Build order: consumption-first — types, then the core that reads them, then the pipeline that produces data, then the apps; **C&C last**, exercising the whole chain a second time. The old refactor spine (de-globalize, functional extraction, `luw` deletion) rides inside P1–P2. TSDoc is definition-of-done in every phase.

- **P1 — Types & schemas.** The `bigintish` module (strict `` `0x${string}` `` hex type, fully tested); the `DataSchema` descriptor + derived types (see the schema strawman); `ChamberData<Schema>` = normalized core + attributes (string value domains); `World`/`View` types including the world-info view; chains rework (`{ network, chainId }`, `BigIntish` ids). Replace `any` in the view layer; delete `luw` types (`CompassBase` union etc.). _Gates: none — all P1 inputs are decided._
- **P2 — Core / client.** De-globalize (delete `modules/importer.ts`'s global + the `Options` bag); functional read surface (`loadWorld`, `getChamber`, coordinate math); the `Crawler` wrapper + chamber-source interface; world registration (#10); events replacement; delete `luw` modules and the namespace/`ModuleInterface` ceremony. _Gates: #1, #4, #9 (API details), #13 (remnants)._
- **P3 — Basic api (contract reads).** The minimal viem read layer the cache needs: `tokenURI` (new), `totalSupply`, `ownerOf`; contract registry keyed by the World binding; remove the silent Mainnet default; delete the dead artifact trees. (Watcher and ownership come later — P8/P10.)
- **P4 — EC cache.** `cache/endless-crawler`: fetch every token's metadata + SVG on-chain via P3, one file per token, committed. Define the EC **world schema + views** for real — the first `DataSchema` instance exercised.
- **P5 — EC converter.** Token metadata + SVG → `ChamberData<classic>`; migrate today's `transform()` logic (compass/entry/`isDynamic` derivation); string terrains/gems. _Gates: #19 remnants; #15 decided here or explicitly deferred._
- **P6 — EC world data (builder).** The builder assembles the mainnet/goerli(/sepolia) world JSON via the canonical serializer (#11): string values, no bitmap, world-info view, real timestamps; `crawler-data` moves to per-world subpath exports. _Gate: #6._
- **P7 — sdk-explorer.** Rebuild on the new API: browse the tiers (token SVGs; playable SVG if #15 lands) + the **same-origin data API** — data routes and converted on-chain routes (#18, closed). Ordering wrinkle: today's explorer depends on `crawler-react` — it may consume core directly until P8 lands, or pull minimal react bindings forward. _Gates: none (#15 affects what's served)._
- **P8 — react.** Simplify provider/hooks over the `Crawler` (delete the scaffolding); the live path lands here: watcher in `crawler-api`, localStorage chamber source + persistence in `crawler-react`. _Gate: #16._
- **P9 — Publish.** Freeze the public surface (#7, with #3's export inventory); complete TSDoc + stand up `apps/docs` (#12); update README + CLAUDE.md; **first npm publish** of `core`/`data`/`api`/`react`. _Gates: #3, #7, #12._
- **P10 — Import into Endless Crawler (ec-dapp).** Migrate ec-dapp onto the published packages (its V2 Phase 9 dependency); owner helpers + delegate.xyz land with the game's needs (#17). _Gate: #17._
- **P11 — C&C cache & world building.** `cache/cryptsandcaverns`; the `c&c` schema, converter, and world build — the multi-schema seam exercised end-to-end. _Gate: #14 (still the v1 blocker)._

_(Broad strokes; split or resequence as decisions land.)_

---

## Open decisions — grouped by implementation phase

Numbers are **stable identifiers** (cross-referenced throughout the doc), not an order; the grouping shows *when* each must be decided. Closed decisions are kept at the end.

### Decide for P2 — core/client

- **#1 — Read model vs. build path.** A **build/generate path exists** — "level generation" is in the SDK's identity and datasets are *created and updated* (from on-chain reads), then canonically serialized (decision #11). So this isn't "read-only or not"; it's **two distinct surfaces**: (i) the **read/interpret** surface the main consumer (`ec-dapp`) uses — which should treat a loaded `Dataset` as **immutable** (no `.set()`, no per-record events); and (ii) a **build** surface, concretized by the [Data pipeline](#data-pipeline-caches-converters-builder-live-chambers--decided-direction): `cache/*` packages fetch tokens (api) → converters in `crawler-data` transform metadata + SVG → the builder assembles world JSON via the canonical serializer. What remains open is only the **read side**: does it need *any* in-memory merge (concrete case: folding live-fetched chambers from #16 into a loaded world — e.g. `mergeChambers(ds, recs) => newDataset`, pure, returns a new value)? Do per-record change events survive at all, or only a coarse "dataset loaded/updated" signal for React? (Grounding: today's bus is browser-only and defective — diagnosis #8.) _Lean: immutable read model + pure merge; drop `.set()` and `ViewRecordChanged`; whatever coarse signal remains is an explicit, environment-agnostic subscription on the `Crawler`, not DOM events; build path is separate._
- **#4 — Where the wrapper lives.** Is the handle/container (decision #9) part of `crawler-core`, or does it live in `crawler-react` / a separate entry? _Leaning: core, framework-agnostic._
- **#9 — Wrapper shape: handle vs. container.** The functional core is settled (decision #1); the question is what ergonomic object, if any, sits on top — driven by the future need for a chamber in dataset A to **jump to a chamber in dataset B**. Two concepts the word "client" was blurring: a **handle** binds *one* dataset to its schema (`a.chamber(coord)`, `a.gridSize`); a **container** holds *many* datasets and owns cross-dataset traversal (a jump returns a dataset-qualified `{ dataset, coord }` — you never "switch"). Options:
  - **(a) Handle + Crawler container.** Per-world schema-aware handle for single-world ops; a multi-world container (**`Crawler`**) holds handles and owns cross-world jumps. Clean separation; the container is also the natural thing React holds.
  - **(b) One client, explicit dataset refs.** A single object holds all datasets; every call names its dataset (`client.chamber('A', coord)`); cross-jumps stay inside it. Fewer concepts, more verbose calls.
  - **(c) Pure functions only.** No wrapper object; single-dataset sugar is an optional handle; cross-jump is a function over the datasets it needs (`followLink([A,B], chamber, dir)`). Thinnest core.
  - _Decided regardless:_ **no mutable "current dataset"** in core (it can't express cross-dataset jumps and re-creates the global-state smell); if a UI needs one, it's UI state. **Naming:** the container/entry point is **`Crawler`** _(lean)_ — rejected `client` (web3 RPC collision) and `world` (taken: it's the dataset's name). See glossary.
  - _World registration pushes toward a container._ *Someone* owns the registered world set, name lookup, and cross-world traversal. That's a real job for a `Crawler` container and makes pure-functions-only (c) less clean (the registry has to live somewhere).
  - _Converter binding pushes the same way:_ `world.import(tokenId, metadata)` needs a world-bound context that knows its schema's converter — natural on a per-world handle, awkward as a bare function (`import` is a reserved word).
  - _Direction — effectively (a), method-style:_ per-world **handle methods** (`world.getChamber(coord)`, `chamber.getDoorsTo(dir)`) over bare functions, delegating to the functional core; **no async at all for static worlds** — world data arrives via per-world imports (#10) and `createCrawler([mainnetData])` is **sync**, as are `crawler.world('mainnet')` and all reads; worlds are referenced **by name** after creation; a `Chamber` carries a runtime pointer to its world. Live tiers (localStorage/on-chain sources) are the only async paths. Remaining: the exact handle/container API (drafted at the surface freeze, #7).
- **#13 — View model redesign — mechanism.** _(the concept is settled — see [Worlds & Views](#core-concept-worlds--views--decided): worlds contain named typed views (`TokenCoord`, `ChamberData` settled; the world-info view; ownership OPEN #17), optional per world. What replaces today's rejected `ViewAccess` build/load machinery is OPEN.)_ Sub-questions:
  - **Typed view definition — DECIDED:** plain typed records + **pure per-view read functions**, with the schema enumerating its view set — no `ViewDefinition` descriptor machinery; the singleton-shaped `WorldInfo` view is admitted alongside keyed maps; fully-typed reads, no `any` (fixes diagnosis #3).
  - **Key normalization — DECIDED:** canonical **stored** keys are **decimal strings**; **hex is always valid input** (keys and values are `BigIntish`, and some data reads better as hex — e.g. `seed` — the canonical serializer #11 fixes each field's canonical form); **in memory, always `bigint`**.
  - **Granularity:** with per-world imports (#10), is **per-view** subpath granularity ever needed? Relevant only for very large worlds (`c&c` ~9,000 dungeons); `ChamberData` is the heavy view, `WorldInfo` the cheap one.
  - **Absent-view semantics:** views are optional per world (decided) — so reads against a missing view need defined behavior: `null`/`undefined`, throw, or a capability query (`hasView(world, name)`).
  - _Lean:_ keep the world JSON layout able to split per view later rather than retrofitting.

### Decide for P5–P6 — EC converter & world build

- **#15 — Ship the SVG in `crawler-data`, converted to a playable form?** _(Leaning yes.)_ The cached token SVG, converted by the builder into a playable form, is used as the **bare-bones playable demo game** in EndlessCrawler. Including it in `crawler-data` would make worlds self-sufficient for the demo but grow the published JSON. Decide what "playable form" is (tilemap-like structure?) and whether it's a view, part of `Chamber`, or a separate artifact. The explorer would serve them — a chamber's **public URL destination** (#18).
- **#6 — `crawler-data` JSON migration vs. load-time adapter** (see Data model). No back-compat constraint, so migrating the JSON is on the table. The regeneration path also carries the value-format changes: numeric `terrain`/`gemType` → readable strings, `bitmap` dropped (see Worlds & Views, #19).

### Decide for P8 — react & live path

- **#16 — Live-chamber persistence & watcher mechanics.** _(the requirement is settled — real-time new-minted chambers, localStorage so refreshes don't refetch, node-compatible core; mechanics OPEN.)_ Sub-questions:
  - **What's persisted:** raw metadata vs converted `ChamberData` (plus `TokenCoord` placement). _Lean: converted, keyed by world + tokenId — conversion is deterministic, so storing the output avoids re-running converters on every load._
  - **Pruning:** when a `crawler-data` redeploy (daily/weekly cadence) folds those tokens into the static world, the localStorage entries become redundant. _Lean: prune on load whenever tier 1 already has the token._
  - **Watch mechanism:** contract event subscription vs polling `totalSupply` (`readTotalSupply` exists — `lib/calls/erc721.ts`) vs on-demand fetch on cache miss. Must respect the never-our-RPC rule.
  - **Where the merge happens:** live chambers must fold into the loaded world as a **pure merge** (decision #1's read-side sub-question, now concrete). The ergonomic entry point is `world.import(tokenId, metadata)` — the world resolves its schema's converter itself (see Worlds & Views, converter binding).

### Decide for P9 — publish

- **#3 — Package boundaries.** **Boundary criterion — DECIDED: everything that deals directly with `ChamberData` lives in `crawler-core`.** A game can import **`crawler-core` + one world from `crawler-data`** and build a complete game; **`crawler-api` and `crawler-react` are strictly optional** (live real-time updates and web helpers, respectively). The package split stays _(leaning: keep `core`/`data`/`api`/`react` — matches published names and ec-dapp's consumption; the workspace grows around them — private `cache/*` packages, converters + builder inside `crawler-data` (build-script devDep on `crawler-api` only), watcher + owner helpers inside `crawler-api` — the published set unchanged)_. Remaining: the full per-package export inventory, drafted with the surface freeze (#7).
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

- **#14 — `c&c` coordinate mapping.** Crypts & Caverns dungeons have **no native coordinates**, but `ChamberData` is keyed by coord (decided) and gameplay navigates by neighbor-coord math. Interim rule: **`coord = chamber ID`**; the `c&c` importer must map/derive real coordinates. How they're calculated is unspecced — capture the spec when it arrives. **A v1 blocker:** the `c&c` converter ships in v1 and can't emit coord-keyed `ChamberData` without this.

### Closed

- **#2 — ~~`tokenIdToCoord`: view vs. derived index~~ CLOSED.** Stays a **first-class stored view** (**`TokenCoord`**): worlds intentionally store the placement relation and `ChamberData` side by side (provenance model — see [Worlds & Views](#core-concept-worlds--views--decided)); derive-at-load is rejected.
- **#5 — ~~How Loot Underworld re-enters later~~ CLOSED.** `luw` is scrapped, not deferred. The real question — how a *new* schema (`c&c`) enters — folds into #8 (parameterized logic vs. separate interpreter).
- **#11 — ~~Canonical serializer~~ CLOSED.** `formatViewData` lives in **`crawler-api`** (`src/lib/utils/formatter.ts`) and **must not be removed from there**; the builder consumes it via crawler-data's build-script devDep on crawler-api (`prettier` stays out of `crawler-data`; it is a runtime dependency of published `crawler-api` — revisit at surface freeze #7 if the footprint matters). Standing requirements: **single required path — every views-data create/update is formatted through it**; compact + human-readable output; the refactor **stops monkeypatching `BigInt.prototype`** (`formatter.ts:17` — a side effect inside a `sideEffects: false` package).
- **#19 — ~~`ChamberData` field classification~~ CLOSED.** The full mapping (see Worlds & Views):
  - **Normalized core:** `coord`, `tokenId`, `name` (every chamber has one — the `c&c` converter fills it), `compass` (**stored**, where the `CoordinateSchema` has one — kept so the dataset is **fully usable without the library**, a data-only consumer still gets readable positions), `terrain` (string, schema domain), `yonder`, `seed`, `tilemap`, **`doors` as `Door[]`** (`{ tile, destCoord, direction?, isLocked?, isEntry? }`), `size` (only in per-chamber-size schemas), and **`isDynamic?: boolean`** — the chamber's **final state is not fully defined and may change**. The EC converter derives it from locked doors; all `c&c` chambers are *not* dynamic (absent). Its count/query surface (`getStaticChamberCount`, `getDynamicChambersCoords`, …) is enumerated at the surface freeze (#7).
  - **`classic` attributes:** `chapter`, `gemPos`, `gemType` (string), `coins`, `worth`.
  - **Gone from the stored record:** `bitmap` (derivable from `tilemap`); `entryDir` (replaced by `Door.isEntry`); `locks: boolean[]` (folded into `Door.isLocked`); **`slug` is never stored** — computed via `chamber.slug()` (`TokenCoord` records are plain ID→coord, so today's stored `slug`/`compass` there go away with the settled view shape).
- **#18 — ~~Explorer data-API shape~~ CLOSED.** Two route families, both **same-origin by default** — no CORS headers, so other sites' browser code can't consume them; a deployment can opt in (useful as an example, or for a local-network game — which also makes it #10's remote world source):
  - **Data routes:** granular chamber lookups (`/api/worlds/:name/chambers/:coord`-style) **and whole-world payloads** — the same-origin default guards the huge-payload risk (a `c&c` world can be very large).
  - **On-chain routes:** kept, for **compare/preview of cached vs live data**, same-origin like the rest; the on-chain result is served **converted to `ChamberData`** so both route families speak the same shape. This is graceful under the raw-api rule: the api yields raw metadata and the *explorer* — which has `crawler-data` — applies the converter server-side.
  - **Visual browsing:** the **token SVGs** (servable straight from the private `cache/*` — the explorer is in-repo, nothing needs publishing), and — if #15 lands (leaning yes) — the **playable SVG**, as a chamber's public URL destination.
  - **Ops:** none — the explorer is not a provider. (Honest limit: same-origin guards *browser-based* abuse; non-browser scripts can still hit a public deployment — acceptable for a tool.)
- **#8 — ~~Schema abstraction depth~~ CLOSED.** Resolved by the **`ChamberSchema`/`CoordinateSchema` split**: the standard client carries **no coordinate math** (games navigate by door `destCoord` — self-sufficiency invariant), so nothing generic needs parameterizing. Each `ChamberSchema` names its `CoordinateSchema` (`coordinateSchema: 'news'`), and **core resolves the library from a name→library registry** at world load. All schemas + libraries live in core; coordinate schemas are reusable across worlds. The type level is schema-parameterized (`ChamberData<Schema>`, types derived from the descriptors), and **every name used in lookups is a literal-union type** — `CoordinateSchemaName = 'news' | 'chamber-id'`, likewise schema and view names; never bare `string`.
- **#10 — ~~World loading & `crawler-data` shape~~ CLOSED: one subpath export per world.** *Don't import or load into memory what is not needed* — and the consumer already knows its worlds when calling `createCrawler`. `crawler-data` exposes **per-world import routes** — `import mainnetData from '@avante/crawler-data/mainnet'` — and `createCrawler([mainnetData])` is **fully sync, no await anywhere** (see Target API). The **root export carries no world JSON**; the bundle contains exactly the worlds imported. No public descriptors, no loader machinery — consumers who want runtime deferral use native dynamic `import()` on the same subpaths. Residuals delegated: per-view subpath granularity for very large worlds → #13; remote/URL loading → not v1, via a CORS-opted explorer deployment (#18). The [chamber-sources model](#chamber-sources--the-crawler-resolves-from-three-tiers--decided-direction) is unchanged: statically imported worlds are tier 1; localStorage (react) and on-chain (api) tiers stay async by nature; core stays browser-free.

---

## Out of scope

- On-chain reads (`crawler-api`) — the existing read layer stays as is, though this plan **adds** api surface: the live watcher, `tokenURI` fetches, owner helpers + delegate.xyz (see Data pipeline and decisions #16/#17).
- New views / new game features.
- **Not** out of scope: the `c&c` **cache + converter ship in v1** — "the perfect case for supporting different worlds." Consequence: decision #14 (c&c coordinate mapping) is a **v1 blocker** (the converter can't emit coord-keyed `ChamberData` without it), and #8's schema seam gets exercised for real. (`luw` is deleted, not deferred.)

---

## Relationship to V2_PLAN.md

- **V2 first, publish last.** V2 modernizes the stack (tooling, TS, packaging, Vitest) but **does not publish**. This refactor reshapes the API, and the finished API is what gets published (P9).
- **No back-compat to preserve.** Nothing is on npm, so there are no external consumers. In-repo consumers (`crawler-react`, `apps/sdk-explorer`) and sibling `ec-dapp` link the workspace and migrate in lockstep — break freely, fix consumers in the same change.
- **Same discipline.** Decision markers, phase gates, green-at-each-step — keep the V2 plan's rigor.
- **Reconcile back into V2 (flagged, not yet applied):**
  - _Serializer:_ resolved — `formatViewData` lives in `crawler-api` with prettier as a runtime dep (decision #11). No V2 edit needed.
  - _Docs:_ V2 doesn't mention `apps/docs`/vocs; the documented-surface spec (decision #12) is new here. No V2 change needed, but V2's packaging work (correct `exports`/types) is a prerequisite for Twoslash to resolve the published types.

# crawler-sdk — SDK Refactor: the `crawler-core` port (P1–P2)

**Status:** _Execution map — implementation in progress._ This document is the **porting map** for the SDK refactor: it grounds each piece of the current code and states its disposition — what **stays**, what is **adapted**, what is **replaced**, what is **deleted**. It holds no specification: target shapes live in **`specs/SDK_SPECS.md`** (authoritative — if this doc and SPECS ever disagree, SPECS wins) and open decisions live in **`specs/SDK_PLAN.md`**. This doc owns only the *mapping* and the *step order*, which neither of those documents covers.

**Scope:** phases **P1 (types & schemas)** and **P2 (core/client)** — the `crawler-core` rewrite plus the P2 one-off data migration and the keep-the-lights-on pass over in-repo consumers. Later phases (P3 api, P5 converter, …) get their own sections here when they start. Rows are rewritten to their outcome as steps land (no changelog narration — git carries the chronology); the document retires when the port completes.

---

## Ground rules

- **SPECS is the target.** Every "→ SPECS §…" pointer below is the definition of done for that row. Code and SPECS move in lockstep (`CLAUDE.md`).
- **Green at each step.** `pnpm build && pnpm typecheck && pnpm test && pnpm lint` pass after every landed step. "Green" means the workspace compiles and tests pass — **not** feature parity: parts of `crawler-api` / `crawler-react` / `apps/sdk-explorer` go dark between P2 and their own rewrite phases (P3/P8/P7), kept compiling by a minimal mechanical pass (see [Consumer lockstep](#consumer-lockstep-at-p2)).
- **No gates.** All P1/P2 inputs are decided (plan, Implementation phases). Names not yet frozen (#7) use the SPECS placeholder names; renaming at the surface freeze is mechanical.
- **TSDoc is definition of done** on every new export (→ SPECS §Type-system rules); `specs/CODING_STYLE.md` applies to all new code.
- **Behavior preservation where behavior survives:** the EC coordinate math is the one algorithmically non-trivial survivor — its existing test fixtures (`coord.ec`, `compass.ec`, `slug.ec`) are ported *first* and must pass against the new functional API unchanged (same inputs, same outputs).

---

## Target layout — `packages/crawler-core/src/`

Proposed module layout (files, not spec — reshuffle freely as implementation demands):

```
src/
  bigintish/          # P1 — BigIntish type, guards, conversions (→ SPECS §BigIntish)
  schema/             # P1 — DataSchema/ChamberSchema/CoordinateSchema types;
                      #      ec + cnc descriptors; derived types (→ SPECS §Schemas)
  coords/             # P1 types, P2 functions — CoordinateSchema library interface,
                      #      name→library registry; news.ts: the NEWS library
                      #      (Dir, Compass, coord/compass/slug math) (→ SPECS §Schemas)
  world/              # P1 types, P2 functions — World/WorldInfo/View types; loadWorld +
                      #      validation; pure per-view reads — written new, no structural
                      #      carry-over from views/ (→ SPECS §Worlds & Views)
  chamber/            # P1 — everything that deals with chamber data: ChamberData<Schema>, Door;
                      #      today's crawler/ helpers kept under their true name (TileType, Dir,
                      #      terrain/gem vocabulary + name tables, the tilemap library:
                      #      toTilemap, tile↔XY, flipDoorPosition; no bitmap survives)
                      #      (→ SPECS §ChamberData)
  client/             # P2 — createCrawler, Crawler container, world handle, Chamber,
                      #      chamber-source + Converter interfaces, coarse subscription
                      #      (→ SPECS §The Crawler client)
  errors.ts           # P1 — the new small typed error set
  index.ts            # the only barrel; exports the public surface, nothing else
```

The current top-level dirs (`modules/`, `views/`, `types/`, `utils/`, `crawler/`) all dissolve into this layout by end of P2. Two very different fates: **`crawler/` is kept wholesale** — its misc chamber-data functions all survive, relocated to `chamber/` (freeing the `crawler` name; the client dir is `client/` to avoid `crawler/crawler` confusion) — while **`views/` is rewritten from scratch**: the new view layer owes nothing to the current structure (classes, access interfaces, per-view metadata); only data-level content carries over (the field mapping via the migration script, the Solidity doc comment).

---

## Disposition map — every current file

Legend: **Stays** = survives near-verbatim, relocated · **Adapted** = survives, reshaped to spec · **Replaced** = the concept survives, the implementation is written new · **Deleted** = no successor · **Deferred** = leaves core for another package/phase.

### `types/`

| Current | Disposition | Where it goes |
|---|---|---|
| `types.ts:10` `HexString = string` (deliberately loosened) | **Replaced** | Strict `` `0x${string}` `` in `bigintish/` — JSON input is handled by `loadWorld` validation, never by weakening the type (→ SPECS §BigIntish). |
| `types.ts:13` `BigIntString` | **Deleted** | Absorbed into `BigIntish`'s decimal-string form (runtime-validated, not a nominal type). |
| `types.ts:16` `Address = string` | **Replaced** | Addresses are `BigIntish` (→ SPECS §BigIntish). No core `Address` type; checksummed rendering is a display concern outside core. |
| `types.ts:19` `BigIntIsh` | **Adapted** | Respelled **`BigIntish`**, moved to `bigintish/` (→ SPECS §BigIntish). |
| `types.ts:22` `Options` bag | **Deleted** | The global's tax (plan, Diagnosis #2). Functions take an explicit `World`; nothing else was ever really being selected. |
| `errors.ts` — all 7 classes (`InvalidModuleInterfaceError`, `MixedModulesError`, `MissingGlobalNamespaceError`, `InvalidModuleError`, `InvalidDataSetError`, `InvalidChainError`, `MissingImplementationError`) | **Deleted** | All are module/global machinery errors; they die with the machinery. Written new in `errors.ts`: `MissingViewError` (→ SPECS §Worlds & Views), world-load validation errors, unknown-world lookup error, `bigintish` conversion errors — small, typed, each with documented `@throws` sites. |

### `utils/`

| Current | Disposition | Where it goes |
|---|---|---|
| `bigint.ts` — `toBigInt`, `bigIntEquals`, `bigIntToString`, `bigIntToHex`, `bigIntToByteArray`, `bigIntToNumberArray`, `binaryArrayToBigInt` | **Adapted** | Consolidated into `bigintish/` with the specced fixes: `toBigInt` rejects `''` and garbage with documented errors (today `BigInt('')` silently yields `0n`); `bigIntEquals` guards **both** args and compares converted `bigint`s strictly (today guards only `a`, `utils/bigint.ts:11`); byte/binary-array conversions ride along (the tilemap helpers need them). Exhaustive test matrix is part of the spec (→ SPECS §BigIntish). |
| `misc.ts:4` `isString` (tests for `bigint` — bug) | **Deleted** | Never correct; nothing keeps it. |
| `misc.ts:13` `isBigInt` | **Adapted** | Becomes a `bigintish/` guard beside `isBigIntish`/`isHexString`. |
| `misc.ts:16` `minifyObject` | **Deferred** | Only real consumer is `transform()` (`views/view.chamberData.ts:178`), which migrates to the EC converter at P5. Kept private wherever still needed; never public. |
| `misc.ts` math grab-bag (`sign`/`abs`/`min`/`max`/`clamp`/`lerp`/`map`/`modf`/degrees-radians), `datetime.ts`, `random.ts` | **Deleted** | Consumer concerns, off the public surface (plan, Current-surface audit). Anything core privately needs is inlined where used. |
| `platform.ts` (`isBrowser`/`isNode`) | **Deleted** | Existed to pick the global namespace and the DOM event target; both die at P2. Core becomes environment-agnostic by construction. |
| `utils/index.ts` `Utils` namespace export | **Deleted** | No grab-bag namespace on the new surface (small-API principle). |

### `views/`

**The whole layer is a complete refactor — written new against SPECS, owing nothing to the current structure.** No class, interface, or record shape from `views/` is a porting template; the rows below exist to confirm each piece is *covered* by the new model (and to name the few data-level items that carry over), not to suggest continuity.

| Current | Disposition | Where it goes |
|---|---|---|
| `view.ts:57–66` `ViewValue = any`, `ViewValueModel = any`, `ViewRecords` | **Replaced** | Plain, deeply-typed records — the P1 headline. No `any` anywhere in the read path (→ SPECS §Type-system rules). |
| `view.ts:68–116` `ViewAccess` (empty marker), `ViewAccessInterface` (4 generic params), the class-per-view machinery | **Replaced** | Pure per-view read functions over typed records; absent view throws `MissingViewError`, record miss returns `undefined`, `world.hasView(name)` is the capability query (→ SPECS §Worlds & Views, #13). No `.set()` — the read model is immutable (→ SPECS §The Crawler client, read model). |
| `view.ts:42` `ViewMetadata` (per-view `{chainId, contractName, contractAddress, timestamp: 0}`) | **Replaced** | Superseded by the **`WorldInfo`** singleton view — one world-level info block instead of the same metadata duplicated (and never stamped) per view (→ SPECS §Worlds & Views). |
| `view.ts:13` `ViewName` enum, `view.ts:20` `DataSet` | **Replaced** | View names become a literal-union type (`'worldInfo' \| 'tokenCoord' \| 'chamberData' \| 'tokenSvg'`); `DataSet` becomes **`World`** (→ SPECS §Worlds & Views). |
| `view.chamberData.ts:9–35` Solidity `Crawl.sol` struct doc comment | **Stays** | Kept verbatim on the new `ChamberData` — it documents the on-chain source of truth (plan, Data model notes). |
| `view.chamberData.ts:38` `ChamberDataModel` (input model) vs stored type split | **Stays** (as a concept) | The converter-staging input type remains distinct from the stored/read record (→ SPECS §ChamberData, last line). The model type itself moves to `crawler-data` beside the P5 converter. |
| `view.chamberData.ts:58` `ChamberData` | **Replaced** | Written new as `ChamberData<Schema>` (→ SPECS §ChamberData — the full field map is the spec, not today's interface). The data-level mapping the migration script applies: `doors: number[]` + `locks: boolean[]` → **`Door[]`** (`tile`/`destCoord`/`destTile`/`direction?`/`isLocked?`/`isEntry?`); `entryDir` → `Door.isEntry`; `bitmap` gone entirely (no bitmap representation survives); numeric `terrain`/`gemType` → schema-domain strings; `chapter`/`gemPos`/`gemType`/`coins`/`worth` → `attributes`; `seed` → `BigIntish` (canonical hex in storage); `yonder` → `number`; `name` required; `compass` stored. |
| `view.chamberData.ts:127` `transform()` (compass derivation, `entryDir` from tilemap, `isDynamic` from locks) | **Deferred** | This is the embryonic EC **converter** — it migrates to `crawler-data` at P5. The **P2 migration script** ports its derivations first (they seed the converter — #6). Nothing of it stays in core. |
| `view.chamberData.ts:186–245` query helpers (`getMultiple`, `getStaticChamberCount`, `getDynamicChamberCount`, `getDynamicChambersCoords`, `getDynamicChambersIds`) | **Replaced** | The *capabilities* re-emerge as pure read functions / handle methods over the new typed view (already in Goals: "enumerate chambers; counts") — designed fresh, exact names + final list at the surface freeze (#7). |
| `view.tokenIdToCoord.ts` — `ChamberCoords` value `{coord: string, slug, compass}` | **Replaced** | The **`TokenCoord`** view is written new: token ID → coord, *value is just the coord* (→ SPECS §Worlds & Views). Stored `slug` dies (never stored — computed); stored `compass` moves onto `ChamberData`. The P2 migration reshapes the data. |
| `chains.ts` — `NetworkName`/`ChainId` enums, `Blank`, lookup tables, `getAllChainIds` etc. | **Replaced** | The chain binding becomes World fields `{ network, chainId, contractAddress, contractName }` (→ SPECS §Chains): `network` a literal union (`'ethereum' \| 'base' \| 'starknet'`), `chainId` a `BigIntish`. The enum registry, `Blank`, and the global lookup helpers are deleted — core carries the binding as data, no chain table. |
| `chains.ts:36` `ContractName` enum (the "move somewhere else" TODO) | **Adapted** | Stays in core as a **literal-union type** on the World binding — required to find the ABI in `crawler-api`'s registry (→ SPECS §Chains). Core carries the name only, never ABIs. |

### `modules/`

| Current | Disposition | Where it goes |
|---|---|---|
| `importer.ts` — the `window/global.CrawlerModules` singleton, `__importDataSets`, `__setCurrentDataSet`, `__getDataSet`, `__resolveChainId`, `__getData` | **Deleted** | The root cause (plan, Diagnosis #1). No successor: worlds are explicit values registered on a `Crawler` instance. The **`./internal` subpath export dies with it** — remove the second tsdown entry, the `exports` map entry, and the vitest alias in `crawler-data`'s config. |
| `client.ts` `createClient` (two-headed: `ModuleId` \| `DataSet[]`, `withBlankDataset`) | **Replaced** | **`createCrawler(worlds)`** — one construction path, sync, explicit (→ SPECS §The Crawler client). `MixedModulesError` is obsolete (a `Crawler` *is* multi-schema); blank datasets have no successor — tests build fixture worlds directly. |
| `modules.ts:15` `ModuleId` (`'ec' \| 'luw'`) | **Replaced** | The axis is **`schema`**: `SchemaName = 'ec' \| 'cnc'` (→ SPECS §Schemas). |
| `modules.ts:30` `CompassBase` (all-optional union of every game's fields: `over`/`under`/`domainId`/`tokenId`…) | **Replaced** | Each `CoordinateSchema` owns its own Compass type. NEWS keeps the four-quadrant union (`CompassNE\|NW\|SE\|SW`, `module.ec.ts:23–53`) — it encodes the validity invariant (exactly one of N/S, one of E/W) in the type. The luw-only fields are deleted. |
| `modules.ts:43` slug separators (`_slugSeparators`, `_defaultSlugSeparator`) | **Stays** | Part of the NEWS slug spec: accept any separator on parse, emit the canonical `,` (plan, Current-surface audit). Moves into `coords/news`. |
| `modules.ts:55` `ModuleInterface` (~40 methods) | **Deleted** | The ceremony existed to keep `luw` generic (plan, Diagnosis #4). The functional NEWS library + the thin world handle replace it. |
| `module.base.ts` — dataset plumbing (`importDataSets`…`createBlankDataSet`), view plumbing (`getView`…`validateView`) | **Deleted** | Global-store delegation and `Options` resolution — dies whole. |
| `module.base.ts:116–147` compass generics (`_minifyCompass`, `_compassEquals`, `validateCoord`, `validateSlug`, `coordToSlug`, `slugToCoord`) | **Adapted** | Become pure functions in `coords/news` (no `this`, no class). `_compassEquals` keeps its semantics but compares via minified forms with strict equality. |
| `module.ec.ts:69–98` `CoordMax`/`CoordOffset`/`CoordMask`/`CoordOne` + `module.ec.ts:130–266` the coordinate math (`validateCompass`, `offsetCompass`, `offsetCoord`, `coordToCompass`, `compassToCoord`, `compassToSlug`, `slugToCompass`) | **Stays** | The crown jewels — the bit-level NEWS algorithms survive verbatim as pure functions in `coords/news`, stripped of namespace/class/`this` and of `AnyCompassDir` looseness (fields are `bigint`; absent quadrant fields simply absent). Existing `coord.ec`/`compass.ec`/`slug.ec` fixtures must pass unchanged. `slugToCompass`'s `result: any` (`module.ec.ts:259`) gets typed. |
| `module.luw.ts` (298 lines) + the `LootUnderworld` namespace | **Deleted** | `luw` is dead (plan, What this SDK is). Deleted at P1, with its types and tests. |
| `events.ts` — `EventName`, `__emitEvent` (DOM `CustomEvent` on `document`; payload passed as event *options*, so it never reaches listeners; no-op in Node) | **Replaced** | The single coarse, typed, environment-agnostic "world updated" subscription on the `Crawler` (#1 → SPECS §The Crawler client). `DataSetImported`/`DataSetChanged`/`ViewRecordChanged` have no successors — per-record events don't survive the immutable read model. |

### `crawler/` (→ `chamber/`) — kept wholesale, minus the bitmap side

**The misc chamber-data functions are all kept** — nothing here is machinery. One deliberate exception: the **bitmap representation vanishes** with the dropped stored field (`BitmapIsh`, the `Bitmap` hex type, `toBitmap` — → SPECS §ChamberData, "Not stored"). Everything else was always **tilemap** vocabulary wearing the "bitmap" name — it relocates to `chamber/` under its true name (typed + TSDoc'd on touch); the only reshaping is what settled spec forces onto *value domains* (strings for stored terrain/gems, tilemap size from the schema), never onto the functions themselves.

| Current | Disposition | Where it goes |
|---|---|---|
| `constants.ts:5` `TileType` | **Stays** | Normalized-core topology vocabulary. Numeric values mirror the on-chain encoding — unchanged. |
| `constants.ts:27` `Dir` (incl. `Over`/`Under`) + `FlippedDir`/`flipDir`/`DirNames` | **Stays** | Kept whole — `Dir` on the core root (used by `Door.direction`/`getDoorsTo`; the NEWS library speaks it — → SPECS §Schemas, NEWS), `flipDir` for door-destination math, `DirNames` as the rendering table. |
| `constants.ts:63` `Terrain`/`OppositeTerrain`/`TerrainNames` + `getOppositeTerrain` | **Adapted** | The functions and relations are kept; only the **stored value domain** changes — terrain is stored as schema-domain strings (→ SPECS §ChamberData), so the opposite-terrain relation and name table are re-domained to the `ec` descriptor's strings. The numeric enum survives as long as anything (migration, converter) still maps chain values; the string domain is what `ChamberData` speaks. |
| `constants.ts:95` `Gem`/`GemNames`/`Hoard` | **Adapted** | Kept as the chain-value vocabulary + name tables — they are exactly the enum→string mapping the migration script and P5 converter apply (stored `gemType` becomes descriptor-domain strings, → SPECS §Schemas; the `Coin === Count === 8` collision disappears from *stored data*). `Hoard` remains as converter-input staging shape (the Solidity struct). |
| `bitmap.ts:6–10` `BitmapIsh`, `Bitmap` (hex type), `toBitmap` (`bitmap.ts:102`) | **Deleted** | Vanish with the dropped stored field — **no bitmap representation exists in the SDK**; the tilemap is the only map form (→ SPECS §ChamberData, "Not stored"). |
| `bitmap.ts` — everything else: `toTilemap`, `findTilesInTilemap`, `tileToXy`/`xyToTile`, `flipDoorPosition`, `Size`/`Xy`/`Tile` types | **Stays** | These were always **tilemap** operations mis-filed under the bitmap name — kept whole as the tilemap helper library in `chamber/`, renamed accordingly (`bitmapSize` → **tilemap size**, fed from the schema's size policy rather than only the hardcoded 16×16 — → SPECS §Schemas). `flipDoorPosition` gains a spec role: it computes **`Door.destTile`** — the arrival tile in the destination chamber (→ SPECS §Door). Housekeeping on touch: dead commented block (lines 66–99) removed, the `@ts-ignore` at line 62 resolved. |

### Tests (`test/`)

| Current | Disposition |
|---|---|
| `coord.ec`, `compass.ec`, `slug.ec` | **Adapted** — same fixtures, re-pointed at the functional NEWS API. These are the behavior lock for the port; they move first at P2. |
| `coord.luw`, `compass.luw`, `slug.luw` | **Deleted** at P1 with `luw`. |
| `bitmap`, `constants`, `chains`, `utils`, `client` | **Adapted/Replaced** — follow their subjects (`chamber/` helpers kept wholesale, schema string domains, World binding fields, `bigintish`, `createCrawler`). |
| _(new)_ `bigintish` exhaustive matrix; `loadWorld` validation; view reads + `MissingViewError` semantics; `Crawler`/handle; pure merge + subscription | **New** — the test coverage specced in SPECS (§BigIntish test matrix is explicit spec). |

---

## P1 — Types & schemas (step order)

Each step lands green; the old machinery keeps compiling *on top of* the new types until P2 kills it.

1. **`bigintish/`** — type, guards, conversions, error behavior, exhaustive tests (→ SPECS §BigIntish). Rewire `utils/bigint.ts` call sites to it; delete `utils/bigint.ts`.
2. **Delete `luw`** — `module.luw.ts`, the three `*.luw` test files, `ModuleId.LootUnderworld` usages, the luw-only `CompassBase` fields (`over`/`under`/`domainId`/`tokenId`). `createClient` temporarily accepts only `ec`.
3. **`schema/`** — `DataSchema`/`ChamberSchema`/`CoordinateSchema` types; the `ec` and `cnc` descriptors (`as const satisfies DataSchema`); derived types (terrain unions, attribute shapes) (→ SPECS §Schemas). Pure types + descriptors; nothing consumes them yet.
4. **`world/` + `chamber/` types** — `World`, `WorldInfo`, the view name union, typed view records (written new — no carry-over from `views/`); `ChamberData<Schema>` + `Door` in `chamber/`; the new `errors.ts` set. Chains rework rides here (`Network` union, `BigIntish` chainId, `ContractName` union) (→ SPECS §Worlds & Views, §Chains, §ChamberData).
5. **`chamber/` helpers** — move `crawler/` (constants + the tilemap library) under its true tilemap naming; delete the bitmap side (`BitmapIsh`/`Bitmap`/`toBitmap`); tilemap size parameterized from the schema, string value domains wired to the descriptors; housekeeping on touch only.
6. **Re-type the old view layer** — replace `ViewValue`/`ViewValueModel`/`ViewRecords` `any`s with the new types wherever the old classes still stand (the P1 exit criterion: no `any` in the read path), converting surviving JSDoc `@type` comments to proper TSDoc as touched.

## P2 — Core / client (step order)

1. **`coords/news`** — extract the EC coordinate math into pure functions + the four-quadrant `Compass`; port the `ec` test fixtures; stand up the name→library registry (`'news'`, `'chamber-id'` stub). Behavior lock: fixtures pass unchanged.
2. **`world/` functions** — `loadWorld` (parse, schema-resolve, validate, normalize keys to `bigint`); pure per-view reads with the specced miss semantics; the chamber query functions.
3. **`client/`** — `createCrawler`, the `Crawler` container (world registry by name, cross-world lookup), the world handle (`getChamber`, `hasView`, `coords`, `import`), `Chamber` with runtime world back-pointer + `slug()`/`compass()`/`getDoorsTo()`; the `Converter` + chamber-source interfaces; pure merge + the coarse subscription (→ SPECS §The Crawler client).
4. **One-off migration script (#6)** — `packages/crawler-data` script (devDep on `crawler-api` for `formatViewData` — → SPECS §Canonical serialization): old JSON → World shape. Derivations: `doors[]`+`locks[]` → `Door[]` with `destCoord` via NEWS offsets and `destTile` via `flipDoorPosition` (seeds the P5 converter), `isEntry` from `entryDir`, enum→string maps (terrain/gem), attribute extraction, `TokenCoord` value flattened to bare coord, `WorldInfo` synthesized from per-view metadata + real migration timestamp, `bitmap`/stored-`slug` dropped, decimal keys / canonical hex `seed`. Mainnet + goerli both migrated; goerli frozen thereafter (no `TokenSvg` ever — → SPECS §Data pipeline). Output committed; script kept (it documents the derivations until P5 supersedes it).
5. **Kill the machinery** — delete `modules/` (importer, client, base, interface, events, ec/luw namespaces), `views/` classes, `types/Options`, `utils/` residue; delete the `./internal` subpath (package.json `exports`, tsdown entry, crawler-data vitest alias); rewrite `src/index.ts` to the new surface only.
6. **Consumer lockstep pass** (below) + full-workspace green.

### Consumer lockstep at P2

In-repo consumers move in the same change, **minimally** — their real rewrites are their own phases:

- **`crawler-data`** — the migrated JSON lands with new-shape exports (`mainnetWorld`, `goerliWorld` — root exports for now; per-world subpaths are P6/#10). The old `DataSet` typing goes.
- **`crawler-api`** — its view-read machinery (`lib/view.ts`, `lib/views/*`) imports the deleted core view types; it is **deleted at P2** rather than shimmed (P3 deletes it anyway — plan, Current-surface audit: "Deleted, not migrated"). The rest of the api (contract reads, `formatViewData`) keeps compiling.
- **`crawler-react`** — `dispatchChamberData` (writes into the global store) and the `useEvent` DOM bridge lose their substrate; minimal mechanical fix: provider holds a `Crawler`, hooks read through it, dead hooks stubbed or removed. Full simplification is P8.
- **`apps/sdk-explorer`** — routes/menus that used the api view machinery are parked (compile-green, feature-dark) until P7; the core-surface catalog re-points at the new API.
- **`ec-dapp`** (sibling repo) — not workspace-linked here; unaffected until P10.

---

## Port decisions surfaced by the map

Small calls this document makes (implementation-level, within settled spec — flagged here so they're reviewable):

1. **`crawler/` is kept wholesale, minus the bitmap side** (user-confirmed): the chamber-data functions survive in `chamber/` under **tilemap** naming ("bitmap" was a misnomer everywhere except the dropped stored field; "grid size" is **tilemap size**); `BitmapIsh`/`Bitmap`/`toBitmap` vanish with the field. Spec only re-domains stored values (strings, schema-fed sizes). `Dir` keeps `Over`/`Under`.
2. **The views layer is a clean-slate rewrite** (user-confirmed) — no structural carry-over from `views/`; SPECS is the only template, the migration script the only data bridge.
3. **The four-quadrant NEWS `Compass` union survives** as the type-level validity encoding (rather than a single all-fields interface).
4. **The byte/binary-array bigint helpers ride into `bigintish/`** (`bigIntToByteArray` & co.) — the tilemap unpacking needs them; they meet the same purity/error rules.
5. **The migration script stamps its own run time** as the migrated worlds' `WorldInfo.timestamp` (ISO 8601 UTC) — the P6 builder re-stamps real build times for cached worlds; goerli keeps the migration stamp forever.
6. **`crawler-api`'s view machinery dies at P2, not P3** — it cannot compile against the post-P2 core, and P3 deletes it regardless.

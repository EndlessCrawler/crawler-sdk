# crawler-sdk — SDK Refactor: execution map

**Status:** _P1–P2 landed; P3–P6 mapped below, to be executed one at a time in order (P3 next)._ This document is the refactor's **execution map**: per phase, it grounds the current code and states dispositions (stays / adapted / replaced / deleted) and step order. It holds no specification — target shapes live in **`specs/SDK_SPECS.md`** (authoritative; wins on conflict) and open decisions in **`specs/SDK_PLAN.md`**. Completed phases collapse to their outcome (git history carries the journey); P7+ get their sections when they start.

---

## P1–P2 — the `crawler-core` port — ✅ LANDED

The core was rewritten in place to the settled spec; the old machinery is gone. Outcome:

- **New core layout** (`packages/crawler-core/src/`): `bigintish/` · `schema/` (descriptors `ec`/`cnc` + derived types + registry) · `chamber/` (`ChamberData<Schema>`, `Door` incl. `destTile`; the old `crawler/` helpers kept wholesale under tilemap naming — no bitmap side survives) · `coords/` (name→library registry; `news.ts` carries the EC bit math verbatim as pure functions — the `coord.ec`/`compass.ec`/`slug.ec` fixtures pass unchanged; `chamberId.ts` is the #14 interim) · `world/` (types, `loadWorld` validation, pure per-view reads, pure merge, `Converter` interface) · `client/` (`createCrawler`, `Crawler`, `WorldHandle`, `Chamber`, coarse subscription, provisional `ChamberSource`) · `errors.ts`. No `any` in core; TSDoc on every export.
- **Deleted with no successor:** the global store (`modules/importer.ts` + the `./internal` subpath export), the `Options` bag, `ModuleInterface`/`ModuleBase`/namespace ceremony, the `ViewAccess` class machinery + per-view metadata, the DOM event bus, blank datasets, the `utils` grab-bag, and everything `luw`.
- **One-off migration (#6):** `crawler-data/scripts/migrateWorlds.ts` (kept — its derivations seed the P5 converter) rewrote the committed JSON to the World shape at `src/worlds/{mainnet,goerli}.json` — WorldInfo view, readable strings, `Door[]` with `destCoord` (NEWS offsets) + `destTile` (`flipDoorPosition`), `isEntry` from `entryDir`, decimal keys, canonical serializer. 277 (mainnet) / 70 (goerli) tokens; a legacy `doors[i] === 0` means *no door on that edge* (validated: never locked, never a door tile). Goerli is frozen as migrated. Invariants are pinned by `crawler-data/test/worlds.test.ts`.
- **Consumer keep-lights-on passes** (real rewrites remain P3/P7/P8):
  - `crawler-data` — root exports `mainnetWorld`/`goerliWorld`/`allWorlds` (`WorldJson`); subpath-per-world + bundled converters land at P5/P6. DevDep on `crawler-api` (build script only, per SPECS).
  - `crawler-api` — view machinery (`lib/view.ts`, `lib/views/*`, the explorer's `/api/view` consumer types) deleted at P2 (P3 deletes it regardless); `formatViewData` brought to spec (local replacer, **no `BigInt.prototype` monkeypatch**); the interim `readContractOrThrow` path (number `chainId`, Mainnet default) survives **only until P3**.
  - `crawler-react` — provider holds an explicit `Crawler`; hooks `useCrawler`/`useWorld`/`useChamber`/`useWorldNames` over the coarse signal; real suite + live path at P8.
  - `apps/sdk-explorer` — re-pointed at the new API (`WorldContext` UI world selection, menus over the handle surface, `/api/read` alive); `/api/view` and converted on-chain reads **parked, feature-dark** until P3/P7.
- **Repo hygiene:** biome re-tightened (`noEmptyInterface`, `noDuplicateObjectKeys`, `noImplicitAnyLet` back to error — their justifying code is gone); remaining warn-downgrades are crawler-api-only P3 debt; `CLAUDE.md` architecture rewritten to the new design.

Port decisions of record (implementation-level, within settled spec): `Dir` keeps `Over`/`Under`; the four-quadrant NEWS `Compass` union survives as the type-level validity encoding (with a loose `NewsCompassInput` for validation inputs); opposite-terrain lives on as `ec` string-domain vocabulary (`oppositeEcTerrain`); the byte/binary-array helpers ride in `bigintish/`; migrated worlds carry the migration run's ISO timestamp (goerli keeps it forever).

## P3 — api contract layer — NEXT

Complete refactor of `crawler-api` into the pure contract interface. **Spec:** → SPECS §`crawler-api` (+ §Canonical serialization, §Chains); #20 closed. Factory names below are the spec's placeholders — final names ride the surface freeze (#7). Already done ahead of it, at P2: the view machinery deletion and the `formatViewData` spec fix. Out of P3 scope: watcher/events (P8, #16), owner helpers + delegate.xyz (P10, #17).

**Current code → disposition** (`packages/crawler-api/src/`):

| File | Disposition |
|---|---|
| `lib/client.ts` | **Split.** Survives as the internal client layer: the chainId→viem-chain map and the cached `PublicClient` per `chainId:rpcUrl`, extended with the spec'd fallback (no `rpcUrl` → viem's default public RPC **+ `console.warn`** — today's silence dies). Deleted: the module-global `setRpcUrl`/`setRpcUrls` registry (RPC becomes an explicit per-factory option), `readContractOrThrow`, `_resolveChainId`'s silent Mainnet default (the chain always comes from the world binding), `_normalizeArgs`. |
| `lib/abis.ts` + `artifacts/CrawlerToken.json` + `contracts/**` (~96 Truffle artifacts) | **Replaced; live artifacts kept, dead trees deleted.** The committed source of truth stays **artifact JSON** (`src/artifacts/`), live contracts only: `CrawlerToken.json` (its `abi` carries `tokenURI`, `totalSupply`, `ownerOf`, `tokenIdToCoord`, `coordToSeed`, `coordToChamberData`, …) plus the Cards artifact backing `getCardsContract()` (ground the exact contract — `CardsMinter`/`FounderStoreV2` — from ec-dapp's actual usage; move it from the dead tree before deleting). A **build-time codegen step derives const-asserted TS ABIs** from those artifacts (→ SPECS §`crawler-api`): a script emits `export const <name>Abi = [...] as const satisfies Abi` into a **generated, git-ignored** module (`src/abis/*.generated.ts` or similar) — `abi` array only, the `networks` address tables never enter the output (addresses come from the world binding or the caller). Never hand-write or commit the TS form. The standard ERC-20/ERC-721 ABIs have no artifacts — author them directly via abitype's human-readable `parseAbi`. Both dead `contracts/` trees and the old `lib/abis.ts` parser delete. |
| `lib/contract.ts` | **Replaced** by the ABI registry keyed by `ContractName` over the const ABIs (`getContractAbi`; `getAllContractNames` survives trivially if kept). `getContractAddress` deleted with the address tables. |
| `lib/calls/erc721.ts` | **Replaced** by world-bound parsed-result helpers: `readTotalSupply(world)`, `readOwnerOf(world, tokenId)`, plus the new **`readTokenMetadata(world, tokenId)`** — `tokenURI` fetched and its data-URI unpacked into `{ metadata, svg }` (decoding is parsing, not converting; the P4 cache and the P8 watcher both consume it). |
| `lib/types/types.ts` | **Deleted.** `ContractArtifacts`, `ReadOptions`, `ReadContractOptions`, `ErrorResult`/`DataResult` + guards all die with the untyped path; new option/result types live beside the factories. |
| `lib/types/errors.ts` | **Adapted.** Small typed error set for the new surface (unknown contract name, unsupported chain); `InvalidChainError`'s never-thrown status ends or the class dies. |
| `lib/utils/utils.ts` | **Deleted** from the public surface: address equality/zero checks are `BigIntish` comparisons (core); `formatAddress` is UI (explorer-side or dropped); `validateArgs` dies with the untyped path. |
| `lib/utils/formatter.ts` | **Stays.** `formatViewData` is the canonical serializer and must not leave this package (SPECS §Canonical serialization). |
| `test/utils.test.ts` | **Deleted** with the utils. |
| `test/contracts.test.ts` | **Adapted.** The binding↔registry address cross-check dies with the `networks` tables; replaced by binding→typed-contract construction checks (ABI resolved by `contractName`, address from the binding). |
| `test/erc721.test.ts` | **Adapted** to the world-bound helpers (live mainnet reads, caller-supplied RPC via `MAINNET_RPC_URL`), plus `readTokenMetadata` unpack coverage. |

**New surface** (per SPECS' illustrative shape): `getWorldContract(world, { rpcUrl })` — viem `getContract` typed by the const ABI resolved from `world.contractName`, address/chain from the binding; `getCardsContract({ chainId, contractAddress, rpcUrl })`; generic `getErc20`/`getErc721` (bundled standard ABIs, caller supplies only the address) + `getTypedContract` (explicit ABI); the parsed-result helpers above. **`BigIntish` addresses at every boundary** — conversion to viem's `Address` happens inside the api via core's `bigintish`. Pipeline supplement reads (`coordToSeed`) go through the typed world contract — no bespoke helpers.

**Step order:**

1. ABI codegen: the generator script (artifact JSON → const-asserted TS, generated + git-ignored), **wired into every path that compiles or type-checks the package** — the `build`, `typecheck`, and `test` package scripts run it first (a shared `gen` script), so a fresh clone works with no manual step and the editor sees the file after any of them. Then the `ContractName`-keyed registry over the generated ABIs; keep the live artifacts, delete the dead `contracts/` trees, `abis.ts`, `contract.ts`.
2. Client layer: chain resolution + cached `PublicClient` + warned public-RPC fallback; delete the RPC registry and `readContractOrThrow`.
3. Factories: `getWorldContract` + `getCardsContract` + generic helpers, with the `BigIntish` boundary conversion.
4. Parsed-result helpers: `readTokenMetadata` (data-URI unpack: metadata JSON + decoded `image` SVG), `readTotalSupply`, `readOwnerOf`.
5. Tests + TSDoc; re-tighten the crawler-api warn-downgrades in `biome.jsonc` (the interim read path's `any` debt dies here); consumer keep-lights-on pass.

**Consumers:** the explorer's `/api/read` route + `serverRpc.ts` are re-pointed **keep-lights-on** onto the typed surface (explicit `rpcUrl` per call — the global registry is gone; `ErrorResult` usage moves explorer-side); the real route-family rebuild stays P7. `crawler-data`'s `migrateWorlds.ts` imports only `formatViewData` — unaffected.

**Done when:** `pnpm build` (sequential) / `typecheck` / `test` / `lint` / `check:pack` green — including from a clean tree with the generated ABI modules deleted (the codegen must regenerate them with no manual step); the generated files are git-ignored and Biome-excluded (same treatment as the generated JSON); crawler-api's Biome `any` warnings at zero; explorer `/api/read` alive on the new path; SPECS/CLAUDE.md lockstep (the "interim read path" notes die).

## P4 — EC cache — queued (after P3)

`cache/endless-crawler`: the pure `tokenURI` archive of the EndlessCrawler mainnet contract. **Spec:** → SPECS §Data pipeline item 1; #21/#22 closed. Greenfield — no `cache/` tree exists and the workspace globs don't cover one.

**Work, in order:**

1. **Workspace plumbing.** Add `cache/endless-crawler` to `pnpm-workspace.yaml`; `"private": true` (never published), scripts-only — no build, no dist, no publish gates; deps: `@avante/crawler-api` + `@avante/crawler-core` (workspace). Exclude `cache/*/data/**` from Biome (same treatment as the generated world JSON).
2. **Fetch script** (`scripts/fetch.ts`). RPC from env (`MAINNET_RPC_URL`; otherwise the api's warned public fallback). Fetch state derives from the files themselves: `readTotalSupply` minus the token files already present = the fetch list — no manifest, no derived data, no struct calls. Per token, `readTokenMetadata` → exactly two committed files in `data/mainnet/`: `<tokenId>.json` (the tokenURI JSON with blob fields extracted — `image` decoded out, `animation_url` dropped as fully derivable; formatted byte-stable via `formatViewData`) and `<tokenId>.svg` (the decoded original SVG).
3. **Dynamic refetch.** A cached SVG with `#Locked` uses marks a dynamic chamber — refetched on every run (its on-chain state changes as doors unlock).
4. **Initial mainnet fetch, committed.** ≥277 tokens — mainnet may have minted past the P2 migration snapshot. Goerli gets no cache, ever (dead chain — the world stays frozen as migrated).
5. **Invariant test** (small): every `.json` has its sibling `.svg`; token files are contiguous from 1; no data-URI blobs remain in the JSON.

The plan's "define the EC world schema + views for real" reads as: the `ec` descriptor landed at P1 — P4 is where it meets live chain output for the first time. Any descriptor↔reality discrepancy surfaced by the fetch is reconciled here, under the specs↔code lockstep rule.

**Done when:** the fetch script is idempotent (a second run fetches nothing but dynamic chambers), the archive is committed, the invariant test is green, and repo hygiene holds (Biome/typecheck unaffected by the data tree).

## P5 — EC converter — queued (after P4)

`EcTokenPayload` → `ChamberData<ec>`, in `crawler-data`. **Spec:** → SPECS §Data pipeline item 2, §`ChamberData<Schema>`, §`Door`; core's `Converter`/`ConvertedToken` (`crawler-core/src/world/converter.ts`) is the interface to implement. #15/#19/#21 closed; naming residuals at #7.

**Grounding:**

- **`scripts/migrateWorlds.ts` seeds the derivations** (why it was kept): door assembly per NEWS direction — `offsetCoord` → `destCoord`, `flipDoorPosition` → `destTile`, `DirNames` direction, `isLocked`/`isEntry` spreads, `0` = no door on that edge — and the `isDynamic` rule (any locked door). Its *input* is gone (the legacy per-view JSON was deleted with the migration; the script can no longer run) — the converter's input is the P4 cache payload instead, so the map/tile facts come from the **SVG parse**, not a struct.
- Core already carries everything else needed: NEWS (`compassToCoord`, `offsetCoord`), the tilemap library (`flipDoorPosition`, `findTilesInTilemap`, `TileType`, sizes from the schema), the `ec` descriptor + `EcTerrain`/`EcGemType` domains.
- **Constraint:** converters are runtime code bundled with the per-world exports (`world.import`), and `crawler-data` has **zero runtime deps** — the SVG parser must be dependency-free string parsing (no DOM, no XML lib), pure and synchronous.

**Work, in order (all under `packages/crawler-data/src/converters/ec/`):**

1. **Payload types** beside the converter: `EcTokenPayload` (`tokenId`, `metadata: EcTokenMetadata`, `svg`, `onchain?: { seed }`) per the SPECS shape; `EcTokenMetadata` typed from the real cached JSON (P4).
2. **SVG → tilemap parser:** `#Paths` rects = walkable tiles; `#Tiles` `<use>` elements = typed tiles (`id` = `TileType`: entry / door / locked door / gem; the `#Up`/`#Down`/`#Left`/`#Right` glyph gives a door's edge; `#Locked` marks locked doors).
3. **The converter** (`Converter<typeof ec, EcTokenPayload>`): `coord` packed from the compass traits via NEWS `compassToCoord`; `name`/`terrain`/`yonder` + attributes (`chapter`, `gemType`, `gemPos`, `coins`, `worth`) from the metadata attributes (already readable strings — normalize case to the schema domains); doors assembled per the migration's derivations, now fed by the parsed tilemap; `isDynamic` from locked doors; `seed` from `payload.onchain` (required in `ChamberData` — a missing supplement is a documented typed `@throws`, the assembler's contract). Returns `ConvertedToken` (`chamberData` + the original `svg` for the `tokenSvg` view).
4. **Interim export** from the crawler-data root: the `ec` converter + payload types (the per-world `WorldBundle` wiring lands at P6).
5. **Equivalence gate — the P5 done-check.** For every mainnet token in the P4 cache that exists in the committed migrated world: assemble the payload from the cache files + `seed` lifted from the migrated world's own record, convert, and require field-for-field equality with the migrated `chamberData`/`tokenCoord` records. This proves the SVG parse reproduces the legacy struct-derived tilemaps exactly. Tokens minted after the migration are covered by `loadWorld` validation + the door/provenance invariants only.

**Done when:** the equivalence suite is green over the full cache, the converter is exported and TSDoc'd, and no runtime dependency entered `crawler-data`.

## P6 — EC world data (builder + per-world exports) — queued (after P5)

The builder re-emits mainnet from the cache, and `crawler-data` moves to its final import surface. **Spec:** → SPECS §Data pipeline item 3, §Canonical serialization, §Package map (one subpath per world), §The `Crawler` client (the `WorldBundle` shape — already landed in core as `createCrawler`'s `WorldSource`). #6/#10/#22 closed.

**Work, in order:**

1. **Builder** (`scripts/buildWorlds.ts` in `crawler-data`): read `cache/endless-crawler/data/mainnet`; fetch the `seed` supplements through the typed world contract (`coordToSeed` via P3's `getWorldContract` — api as build-script devDep; supplements are immutable, so refetching is deterministic); convert via the P5 converter; assemble the `WorldJson` — `worldInfo` (real ISO build `timestamp`), `tokenCoord`, `chamberData`, and the **first `tokenSvg` view** (the cache's original SVGs) — validate with `loadWorld` before writing; write `src/worlds/mainnet.json` via `formatViewData`. Goerli is untouched — frozen as migrated, never rebuilt, never gains `tokenSvg`.
2. **Regeneration check:** the rebuilt `mainnet.json` differs from the migrated file only by `timestamp`, the added `tokenSvg` view, and tokens minted since the migration — byte-stable everywhere else (the canonical-serializer discipline made observable).
3. **Per-world subpath exports (#10):** `src/mainnet.ts` / `src/goerli.ts`, each exporting a `WorldBundle` (`{ world, converter }` — goerli bundles the `ec` converter too); tsdown multi-entry + `exports` map entries (`./mainnet`, `./goerli`); the root barrel **drops `mainnetWorld`/`goerliWorld`/`allWorlds`** — the root ships no world JSON (it keeps the converter + payload types and any shared types).
4. **Fix importers in the same change:** `apps/sdk-explorer/src/lib/crawlerClient.ts` (`allWorlds`), `packages/crawler-api/test/contracts.test.ts`, and `packages/crawler-data/test/worlds.test.ts` all move to subpath imports (the test configs' source aliases gain the subpaths).
5. **Retire `scripts/migrateWorlds.ts`** + the `migrate:worlds` package script: its inputs are already gone, and its derivations now live in the converter (P5) and builder — the goerli output it produced is the frozen committed file. Update the invariant tests: mainnet counts become the fetch snapshot (≥277), `hasView('tokenSvg')` flips true for mainnet (stays false for goerli).
6. **Packaging gate:** `check:pack` (publint + attw) covers the new multi-entry surface; verify a root import pulls no world JSON (dist inspection / bundle check — the #10 hard constraint).

**Done when:** fresh sequential `pnpm build` + all tests + `check:pack` green; the regeneration check holds; SPECS/CLAUDE.md lockstep (the "interim root exports" notes die; crawler-data's section describes the subpath surface).

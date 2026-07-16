# crawler-sdk — SDK Refactor: execution map

**Status:** _P1–P3 landed; P4–P6 mapped below, to be executed one at a time in order (P4 next)._ This document is the refactor's **execution map**: per phase, it grounds the current code and states dispositions (stays / adapted / replaced / deleted) and step order. It holds no specification — target shapes live in **`specs/SDK_SPECS.md`** (authoritative; wins on conflict) and open decisions in **`specs/SDK_PLAN.md`**. Completed phases collapse to their outcome (git history carries the journey); P7+ get their sections when they start.

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

## P3 — api contract layer — ✅ LANDED

`crawler-api` was rewritten into the pure contract interface (spec: → SPECS §`crawler-api`, §Chains, §Canonical serialization). Outcome:

- **ABI codegen:** `scripts/generateAbis.ts` derives the git-ignored, Biome-excluded `src/generated/abis.ts` (const-asserted ABIs + the `contractAbis` registry, `abi` arrays only — no `networks` tables) from the 8 committed live artifacts in `src/artifacts/` (CrawlerToken, CardsMinter, CrawlerIndex, CrawlerPlayer, CrawlerQueryV1, CrawlerGeneratorV1, CrawlerMapperV1, CrawlerRendererV1). The package's `gen` script runs before `build`/`typecheck`/`test`/`watch` — a fresh clone needs no manual step. Registry surface (`lib/abis.ts`): `contractAbis`, `getContractAbi` (typed by name; throws `UnknownContractError`), `getAllContractNames`, `KnownContractName`.
- **Client layer** (`lib/client.ts`): `getPublicClient(chainId: BigIntish, rpcUrl?)` — mainnet/goerli/sepolia, cached per `chainId:rpcUrl`, no `rpcUrl` → viem's default public RPC + `console.warn` (once per cached client), `UnsupportedChainError` otherwise. The global `setRpcUrl(s)` registry, `readContractOrThrow`, and the silent Mainnet default are gone.
- **Factories** (`lib/contracts.ts`): `getWorldContract(world, { rpcUrl })` (ABI by `world.contractName`, address/chain from the binding), `getCardsContract`/`getErc20`/`getErc721` (`{ chainId, contractAddress, rpcUrl }`), `getTypedContract` (+ explicit `abi`) — `BigIntish` → checksummed `Address` conversion inside the api.
- **Parsed-result helpers** (`lib/reads.ts`): `readTotalSupply` → `bigint`, `readOwnerOf` → checksummed `HexString`, `readTokenMetadata` → `{ metadata, svg }` (tokenURI data-URI unpacked, `image` lifted out and delivered decoded as `svg`; typed `InvalidTokenMetadataError`).
- **Deleted with no successor:** the `lib/abis.ts` artifact parser, `lib/contract.ts` + the `networks` address tables, `lib/calls/`, `lib/types/` (`ContractArtifacts`, `ReadOptions`, `ReadContractOptions`, `ErrorResult`/`DataResult` + guards, the old error classes), `lib/utils/utils.ts`, `test/utils.test.ts`. `formatViewData` stayed in place (`lib/utils/formatter.ts`); its prettier imports are now typed (the `@ts-ignore`s died) and its parameter is `unknown`.
- **Consumers/tests/hygiene:** explorer `/api/read` + `serverRpc.ts` re-pointed keep-lights-on (world binding from `crawler-data`, explicit `rpcUrl` per call, arg coercion + dynamic-dispatch cast explorer-side; verified live). Tests: registry + factory construction checks, live mainnet reads (incl. the `coordToSeed` supplement path against the committed world), `readTokenMetadata` unpack, a small `formatViewData` pin. Biome `noExplicitAny`/`useIterableCallbackReturn`/`noTsIgnore` re-tightened to error.

Port decisions of record: the registry key union (`KnownContractName`) is a generated **superset** of core's world-bindable `ContractName` (which stays `'CrawlerToken'` — expanding it would weaken world-binding types); the standard ERC-20/ERC-721 ABIs come from viem's bundled `erc20Abi`/`erc721Abi` instead of hand-authored `parseAbi` (platform-over-wrapper rule); factory returns carry explicit `TypedContract<A>` annotations (the inferred viem `getContract` types are unserializable by the dts bundler).

## P4 — EC cache — NEXT

`cache`: one private, contract-agnostic package archiving `tokenURI` output; P4 lands its EC-mainnet data. **Spec:** → SPECS §Data pipeline item 1; #21/#22 closed. Greenfield — no `cache/` tree exists and the workspace globs don't cover one.

**Work, in order:**

1. **Workspace plumbing.** Add `cache` to `pnpm-workspace.yaml`; `"private": true` (never published), scripts-only — no build, no dist, no publish gates; deps: `@avante/crawler-api` + `@avante/crawler-core` + `@avante/crawler-data` (workspace — data supplies the world binding). Exclude `cache/data/**` from Biome (same treatment as the generated world JSON).
2. **Registry** (`worlds.json`). Lean, keyed by world `name` → `{ dataDir, rpcEnv }`; the keyset is the coverage (EC mainnet only at P4). No binding fields — network/chainId/address/ABI come from the `crawler-data` world resolved by name (`allWorlds`) + `getWorldContract(world)`.
3. **Fetch script** (`scripts/fetch.ts`), one generic script over every registered world. RPC from the entry's env var (`MAINNET_RPC_URL`; otherwise the api's warned public fallback). Pin block `B`; resolve the world by name; `getWorldContract(world, { rpcUrl })`; `readTotalSupply` at `B` minus the token files already present = the fetch list (empty invalidation policy — **missing-only**; no manifest, no struct calls). Per token, `readTokenMetadata` at `B` → two committed files in `data/<dataDir>/<network>/`: `<tokenId>.json` (tokenURI JSON with blob fields extracted — `image` decoded out, `animation_url` dropped as fully derivable; byte-stable via `formatViewData`) and `<tokenId>.svg` (the decoded original SVG). Each on-chain read retries **3× with a 1 s wait**, then aborts the run non-zero.
4. **`_cache.json`** per network dir (byte-stable via `formatViewData`): provenance echo (world `name`/`network`/`chainId`/`contractName`/`contractAddress`) + `fetchedThroughBlock` (advanced to `B` on every clean run) + `updatedAt` + `tokens{ id: { block, fetchedAt } }`. No dynamic/`#Locked` refetch — invalidation is a schema-level policy in core, currently empty; the Minted-neighbour model is deferred with real-time updates (→ plan #16), the block/watermark data banked now.
5. **Initial mainnet fetch, committed.** ≥277 tokens — mainnet may have minted past the P2 migration snapshot. Goerli gets no cache, ever (dead chain — the world stays frozen as migrated).
6. **Invariant test** (small): every `.json` has its sibling `.svg`; token files are contiguous from 1 (`_cache.json` excluded); no data-URI blobs remain in the JSON; `_cache.json`'s binding echo matches the resolved world.

The plan's "define the EC world schema + views for real" reads as: the `ec` descriptor landed at P1 — P4 is where it meets live chain output for the first time. Any descriptor↔reality discrepancy surfaced by the fetch is reconciled here, under the specs↔code lockstep rule.

**Done when:** the fetch script is idempotent (a second run fetches nothing — only `fetchedThroughBlock` advances), the archive + `_cache.json` are committed, the invariant test is green, and repo hygiene holds (Biome/typecheck unaffected by the data tree).

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

1. **Builder** (`scripts/buildWorlds.ts` in `crawler-data`): read `cache/data/endless-crawler/mainnet` (dir resolved from `cache/worlds.json` by fs path — no package import); fetch the `seed` supplements through the typed world contract (`coordToSeed` via P3's `getWorldContract` — api as build-script devDep; supplements are immutable, so refetching is deterministic); convert via the P5 converter; assemble the `WorldJson` — `worldInfo` (real ISO build `timestamp`), `tokenCoord`, `chamberData`, and the **first `tokenSvg` view** (the cache's original SVGs) — validate with `loadWorld` before writing; write `src/worlds/mainnet.json` via `formatViewData`. Goerli is untouched — frozen as migrated, never rebuilt, never gains `tokenSvg`.
2. **Regeneration check:** the rebuilt `mainnet.json` differs from the migrated file only by `timestamp`, the added `tokenSvg` view, and tokens minted since the migration — byte-stable everywhere else (the canonical-serializer discipline made observable).
3. **Per-world subpath exports (#10):** `src/mainnet.ts` / `src/goerli.ts`, each exporting a `WorldBundle` (`{ world, converter }` — goerli bundles the `ec` converter too); tsdown multi-entry + `exports` map entries (`./mainnet`, `./goerli`); the root barrel **drops `mainnetWorld`/`goerliWorld`/`allWorlds`** — the root ships no world JSON (it keeps the converter + payload types and any shared types).
4. **Fix importers in the same change:** `apps/sdk-explorer/src/lib/crawlerClient.ts` (`allWorlds`), `packages/crawler-api/test/contracts.test.ts`, and `packages/crawler-data/test/worlds.test.ts` all move to subpath imports (the test configs' source aliases gain the subpaths).
5. **Retire `scripts/migrateWorlds.ts`** + the `migrate:worlds` package script: its inputs are already gone, and its derivations now live in the converter (P5) and builder — the goerli output it produced is the frozen committed file. Update the invariant tests: mainnet counts become the fetch snapshot (≥277), `hasView('tokenSvg')` flips true for mainnet (stays false for goerli).
6. **Packaging gate:** `check:pack` (publint + attw) covers the new multi-entry surface; verify a root import pulls no world JSON (dist inspection / bundle check — the #10 hard constraint).

**Done when:** fresh sequential `pnpm build` + all tests + `check:pack` green; the regeneration check holds; SPECS/CLAUDE.md lockstep (the "interim root exports" notes die; crawler-data's section describes the subpath surface).

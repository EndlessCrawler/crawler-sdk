# crawler-sdk — SDK Refactor: execution map

**Status:** _P1–P2 landed._ This document is the refactor's **execution map**: per phase, it grounds the current code and states dispositions (stays / adapted / replaced / deleted) and step order. It holds no specification — target shapes live in **`specs/SDK_SPECS.md`** (authoritative; wins on conflict) and open decisions in **`specs/SDK_PLAN.md`**. Completed phases collapse to their outcome (git history carries the journey); later phases (P3 next) get their own sections here when they start.

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

## P3 — api contract layer — not started

Section added when P3 begins (spec: → SPECS §`crawler-api`; grounding in `SDK_PLAN.md` §crawler-api). Already done ahead of it, at P2: the view machinery deletion and the `formatViewData` spec fix.

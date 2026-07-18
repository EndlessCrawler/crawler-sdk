# sdk-explorer

The SDK's **browse tool** and **data API** (see `specs/SDK_SPECS.md` §`apps/sdk-explorer`) —
and the **reference implementation of the `crawler-react` bindings**: browsing goes through
the hooks and `<ChamberSvg>`, never hand-rolled equivalents. The app uses the public SDK
surface only (no internal imports). Next 16 App Router; Tailwind v4 + TanStack Query are
app-side choices, never SDK dependencies.

## Browse UI

- `/` — the world index (entry into each world)
- `/world/<name>` — the per-world chamber index: a grid of the world's token SVGs
- `/world/<name>/chamber/<slug>` — chamber detail: the original SVG beside the chamber's
  `ChamberData`, with clickable doors navigating to their `destCoord` chambers

Route slugs are separator-less (`/world/mainnet/chamber/S1W1`); the coordinate schema
parses any separator. Worlds without a `TokenSvg` view (goerli) browse data-only.

The JSON console pages (`/data`, `/apis`) are the dev view of the client surface and the
route families.

## Data API

Two same-origin-by-default route families (bigint-safe JSON):

- `GET /api/data/<world>` — the whole-world payload (the stored `WorldJson`, canonical form)
- `GET /api/data/<world>/chamber/<coord>` — one `ChamberData` record by coord
- `GET /api/data/<world>/token/<tokenId>` — the same lookup by token id
- `GET /api/data/<world>/svg/<tokenId>` — the original token SVG, as `image/svg+xml`
- `GET /api/onchain/<world>/token/<tokenId>` — the token read live (the api's
  `assembleTokenPayload`), converted server-side, served as `ChamberData`

Lookup keys are `BigIntish` — decimal and hex both parse. The cached-vs-live compare is
UI (the `/apis` console); there is no compare endpoint.

CORS is opt-in per deployment: set `EXPLORER_CORS_ORIGINS` (comma-separated origins, or
`*`) to serve both families cross-origin — that's what makes a deployment a remote world
source. The on-chain routes read the RPC url from `MAINNET_RPC_URL` (`src/lib/serverRpc.ts`).

## Development

```sh
pnpm run watch        # repo root — rebuild packages on change
cd apps/sdk-explorer && pnpm dev   # Next dev (webpack) on :3000
```

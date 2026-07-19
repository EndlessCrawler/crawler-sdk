# @avante/crawler-react

React bindings for the Crawler SDK — a provider, hooks, and components over an
explicit [`Crawler`](https://github.com/EndlessCrawler/crawler-sdk/blob/main/packages/crawler-core) container. No global state, no DOM events:
reactivity comes from the `Crawler`'s coarse, typed "world updated" subscription.

> **Status: alpha, pre-publish.** This README documents the landed surface
> (`specs/SDK_SPECS.md` §`crawler-react`). Peers: `react ^18 || ^19` +
> `@avante/crawler-core`; `@avante/crawler-api` is an *optional* peer, loaded
> only when live updates are on.

## Setup

Create the `Crawler` once (module scope) from the world your app imports, and hand
it to the provider. Live updates are **one prop** — the SDK resolves the watcher,
payload assembler, converter, and persistence by itself:

```tsx
// crawlerClient.ts
import { createCrawler, type Crawler } from '@avante/crawler-core';
import mainnetData from '@avante/crawler-data/mainnet'; // world data + its converter

export const crawler: Crawler = createCrawler([mainnetData]);
```

```tsx
// App.tsx
import { CrawlerProvider } from '@avante/crawler-react';
import { crawler } from './crawlerClient';

export default function App({ children }: React.PropsWithChildren) {
  return (
    <CrawlerProvider crawler={crawler} liveUpdate={{ rpcUrl: MY_RPC_URL }}>
      {children}
    </CrawlerProvider>
  );
}
```

- `liveUpdate` — `boolean | { rpcUrl?, client?, intervalMs?, persist?, worlds? }`.
  New mints stream into the world as they happen (plus their invalidated
  neighbours), and imported chambers persist in localStorage so a refresh doesn't
  refetch. Omit it and the app is fully static. Requires `@avante/crawler-api`
  to be installed (it is imported lazily, only on this path).
- `defaultWorld` — names the world the hooks resolve to in a multi-world app.
  With a single registered world (the typical app), hooks need no world name at all.

## Hooks

The world name is an **optional trailing argument** on every hook: explicit
argument → the provider's `defaultWorld` → the crawler's sole registered world.
Schema-typed variants are one-line aliases of a shared base hook — use the alias
matching your world's schema and never write `<typeof ec>` yourself:

```tsx
import type { ChamberEC, WorldHandleEC } from '@avante/crawler-core';
import {
  type ChamberNeighbor, useChamberEC, useChamberNeighbors, useWorldEC,
} from '@avante/crawler-react';

function WorldStats() {
  // The stable world handle — re-renders when the world merges a live chamber.
  const world: WorldHandleEC = useWorldEC();
  return (
    <p>
      {world.name}: {world.getChamberCount()} chambers, {world.getTokenCount()} tokens
    </p>
  );
}

function Room({ slug }: { slug: string }) {
  // One lookup hook, any key: { tokenId } | { coord } | { slug } | { compass }.
  const chamber: ChamberEC | undefined = useChamberEC({ slug });
  const neighbors: ChamberNeighbor[] = useChamberNeighbors({ slug });
  if (!chamber) return null;
  return (
    <div>
      <h3>
        {chamber.name} — {chamber.terrain}, yonder {chamber.yonder}
      </h3>
      {neighbors.map(({ door, chamber: dest }) => (
        <button key={door.tile} disabled={!dest}>
          {dest?.name ?? 'unminted'}
        </button>
      ))}
    </div>
  );
}
```

| Hook | Returns | Notes |
| --- | --- | --- |
| `useCrawler()` | `Crawler` | throws outside a `CrawlerProvider` |
| `useWorldNames()` | `string[]` | the registered world names |
| `useWorldEC(worldName?)` | `WorldHandleEC` | alias of `useWorldSchema<S>`; `useWorldCC` for `cnc`; plain `useWorld` returns the schema union |
| `useChamberEC(locator, worldName?)` | `ChamberEC \| undefined` | alias of `useChamberSchema<S>`; locator = `{ tokenId? , coord?, slug?, compass? }`, first-present-wins |
| `useChambers(worldName?)` | `Chamber[]` | all chambers — index/grid pages, maps |
| `useWorldInfo(worldName?)` | `WorldInfo` | the world's info block |
| `useTokenSvg(tokenId, worldName?)` | `string \| undefined` | the original on-chain SVG |
| `useChamberNeighbors(locator, worldName?)` | `ChamberNeighbor[]` | each door resolved to its destination chamber |
| `useWorldSelector(selector, worldName?)` | `T` | memoized derived read over the immutable `World` value |

All static reads are synchronous — the world data is already in memory. Hook
return values change identity when their world merges, so they are safe as plain
memo/effect deps.

## Components

```tsx
import { ChamberSvg } from '@avante/crawler-react';

// Renders the chamber's original on-chain SVG; empty when the world
// carries no TokenSvg view. Styling is yours (className/style pass through).
<ChamberSvg chamber={chamber} className="w-64" />;
```

See [`@avante/crawler-core`](https://github.com/EndlessCrawler/crawler-sdk/blob/main/packages/crawler-core) for the full handle/chamber surface.

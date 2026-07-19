# crawler-sdk

[Endless Crawler](https://endlesscrawler.io/) SDK Monorepo

[@ EndlessCrawler](https://twitter.com/EndlessCrawler)

## SDK structure

| Packages                  |            |                  |                      | Status  |
|---------------------------|------------|------------------|----------------------|---------|
| `@avante/crawler-core`      | Typescript | off-chain        | types and api        | alpha   |
| `@avante/crawler-data`      | Typescript | off-chain        | cached map data      | alpha   |
| `@avante/crawler-api`       | Typescript | on-chain         | web3 api             | alpha   |
| `@avante/crawler-react`     | React      | on/off-chain     | components and hooks | alpha   |
| `@avante/crawler-contracts` | Sol/Cairo  | on-chain         | contracts and abi    | planned |

| Apps                      |            |                  |                      | Status  |
|---------------------------|------------|------------------|----------------------|---------|
| `/apps/sdk-explorer`        | Next.js    | on-chain         | sdk examples         | alpha   |
| `/apps/docs`                | vocs       | off-chain        | API reference & guides | alpha |


## Usage

**WARNING**: Things are still changing and can break at any time.


### Install

```
npm install @avante/crawler-core @avante/crawler-data
```


### Core tools

Create a `Crawler` from static worlds and read chambers

```ts
import { createCrawler, Dir } from '@avante/crawler-core';
import mainnetData from '@avante/crawler-data/mainnet'; // world + its converter, one export per world

const crawler = createCrawler([mainnetData]); // sync, explicit — no globals
const world = crawler.world('mainnet');

const chamber = world.getChamberBySlug('S1,W1'); // or by coord / token id
chamber?.terrain;                  // 'earth'
chamber?.slug();                   // 'S1,W1' — computed, never stored

// navigation is door-based
const [north] = chamber?.getDoorsTo(Dir.North) ?? [];
const next = north && world.getChamber(north.destCoord);
```

Coordinate math (NEWS) is schema-bound, reached through the world

```ts
const coord = world.coords.slugToCoord('S1,W1'); // packed uint256 as bigint
world.coords.offsetCoord(coord, Dir.North);
world.coords.coordToCompass(coord);              // { south: 1n, west: 1n }
```


## Monorepo workflow

This is a **monorepo**, a single repository containing multiple packages, managed with [pnpm](https://pnpm.io/workspaces).

There is no reason to download this repository unless you want to contribute. As an SDK user, better choose one of the [included packages](#sdk-structure) instead.


#### Initialize this monorepo after download

The toolchain is pinned with [asdf](https://asdf-vm.com/) via `.tool-versions` (**Node 24.18.0**, **pnpm 10.30.1**). With asdf installed:

```sh
asdf install            # installs the pinned Node + pnpm
pnpm install
pnpm run build          # sequential build (packages depend on crawler-core)
```

Without asdf, install Node ≥ 24.18.0 and pnpm 10 manually, then `pnpm install`.

Formatting/linting is [Biome](https://biomejs.dev/) (`pnpm run lint`, `pnpm run format`); see `specs/CODING_STYLE.md`.


#### To execute a script/task on all packages...

> [pnpm run](https://pnpm.io/cli/run)

```sh
pnpm -r run clean
pnpm -r run build
pnpm -r run test
pnpm -r run update

# shortcuts tasks for all packages + apps
npm run build:all
npm run clean
npm run test
npm run update
# shortcuts tasks for all packages
npm run build
npm run watch
npm run watch:test
```

#### To execute a script/task on specific packages...

> [filtering](https://pnpm.io/filtering)

```sh
# multiple packages
pnpm --filter "@avante/*" test
pnpm --filter "@avante/*" update -D typescript

# single package
pnpm --filter sdk-explorer build
pnpm --filter "@avante/crawler-core" test
pnpm --filter "*/crawler-core" test
pnpm --filter "*core" update -D typescript

# shortcuts tasks for all packages
npm run build:core
npm run build:data
npm run build:api
npm run build:react
npm run test:core
npm run test:data
npm run test:api
npm run test:react
npm run watch:test:core
npm run watch:test:data
npm run watch:test:api
npm run watch:test:react
```

#### To execute a shell command on all packages...

> [pnpm exec](https://pnpm.io/cli/exec)

```sh
pnpm -r exec vitest run
```

#### To work on apps/sdk-explorer, watching all packages

terminal 1:

```sh
pnpm run watch
```

terminal 2:

```sh
cd apps/sdk-explorer
npm run dev
```

#### Docs (`apps/docs`)

The API reference is generated from the TSDoc'd surface (typedoc → vocs);
guides carry Twoslash-verified examples compiled against the **built**
packages, so build first:

```sh
pnpm run build
pnpm run check:docs        # generate reference + build the site (the docs gate)
pnpm --filter docs dev     # local docs dev server
```




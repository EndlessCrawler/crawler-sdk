# crawler-sdk

[Endless Crawler](https://endlesscrawler.io/) SDK Monorepo

[@ EndlessCrawler](https://twitter.com/EndlessCrawler)

## SDK structure

| Packages                  |            |                  |                      | Status  |
|---------------------------|------------|------------------|----------------------|---------|
| @avante/crawler-core      | Typescript | off-chain        | types and api        | alpha   |
| @avante/crawler-data      | Typescript | off-chain        | cached map data      | alpha   |
| @avante/crawler-api       | Typescript | on-chain         | web3 api             | broken  |
| @avante/crawler-react     | React      | on/off-chain     | components and hooks | alpha   |
| @avante/crawler-contracts | Sol/Cairo  | on-chain         | contracts and abi    | planned |

| Apps                      |            |                  |                      | Status  |
|---------------------------|------------|------------------|----------------------|---------|
| /apps/sdk-explorer        | Next.js    | on-chain         | sdk examples         | alpha   |


## Usage

**EARLY ALPHA**

Things are still changing and can break at any update.


### Core tools

Initialize an empty client

```js
import {
	createClient,
	EndlessCrawler,
	LootUnderworld,
	Dir,
} from '@/avante/core'

// Compatible with Endless Crawler
type Compass = EndlessCrawler.Compass
const client: ModuleInterface = createClient(EndlessCrawler.Id) as EndlessCrawler.Module
const s1w1 = { south: 1, west: 1 } as Compass
const s1w2 = client.offsetCompass(s1w1, Dir.West)

// Compatible with Loot Underworld
type Compass = LootUnderworld.Compass
const client: ModuleInterface = createClient(LootUnderworld.Id) as LootUnderworld.Module
const s1w1o1 = { south: 1, west: 1, over: 1 } as Compass
const s1w1u1 = client.offsetCompass(s1w1o1, Dir.Under)
```

Initialize a client with cached data

```js
import {
	createClient,
	EndlessCrawler,
} from '@/avante/core'
import {
	mainnetDataSet,
} from '@/avante/data'

// compatible with Endless Crawler
type Compass = EndlessCrawler.Compass
const client: ModuleInterface = createClient([mainnetDataSet]) as LootUnderworld.Module
const s1w1 = { south: 1, west: 1 } as Compass
const chamber = client.get(s1w1)
```


## Monorepo workflow

This is a **monorepo**, a single repository containing multiple packages, managed with [pnpm](https://pnpm.io/workspaces).

There is no reason to download this repository unless you want to contribute. As an SDK user, better choose one of the [included packages](#sdk-structure) instead.


#### Initialize this monorepo after download

Install [pnpm](https://pnpm.io/installation) first.

```sh
pnpm install
pnpm -r run build
```


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
pnpm -r exec jest
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




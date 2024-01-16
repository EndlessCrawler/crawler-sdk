# crawler-sdk

[Endless Crawler](https://endlesscrawler.io/) SDK Monorepo

[@ EndlessCrawler](https://twitter.com/EndlessCrawler)

## SDK structure

**EARLY ALPHA**

Things can change and break at any time.

#### Packages in development

* `@avante/crawler-data` : Game data and tools
* `@avante/crawler-api` : Web3 API, contracts ABI
* `sdk-explorer` : SDK explorer, examples, cacher

#### Planned

* `@avante/crawler-react` : React framework (off-chain/on-chain, ready to use)
* `@avante/crawler-contracts` : Solidity contracts



## Which package should I get?


| Packages                  |            |                  |                    |
|---------------------------|------------|------------------|--------------------|
| @avante/crawler-data      | Typescript | off-chain        | just cached data   |
| @avante/crawler-core      | Typescript | off-chain        | chamber access api |
| @avante/crawler-web3      | Typescript | on-chain         |  |
| @avante/crawler-react     | React      | on/off-chain     |  |


| Apps                      |            |                  |                  |
|---------------------------|------------|------------------|------------------|
| /apps/sdk-explorer        | Next.js    | on-chain         | sdk example app  |




## Monorepo workflow

This is a **monorepo**, a single repository containing multiple packages, managed with [pnpm](https://pnpm.io/workspaces).

There is no reason to download this repository unless you want to contribute. As an SDK user, better [choose](#which-package-should-i-get) one of the included packages instead.


#### Initialize this monorepo after download

Install [pnpm](https://pnpm.io/installation) first.

```sh
pnpm install
pnpm -r run build
```


#### To execute a script/task on all packages...

> [pnpm run](https://pnpm.io/cli/run)

```sh
# on all packages
pnpm -r run build
pnpm -r run test
pnpm -r run update
pnpm -r run lint
```


#### To execute a script/task on specific packages...

> [filtering](https://pnpm.io/filtering)

```sh
# multiple
pnpm --filter "@avante/*" test
pnpm --filter "@avante/*" install -D tsc-watch

# single
pnpm --filter sdk-explorer build
pnpm --filter "@avante/crawler-api" test
pnpm --filter "*/crawler-api" test
pnpm --filter "*api" test
pnpm --filter "*api" install @types/node -D
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




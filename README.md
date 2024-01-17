# crawler-sdk

[Endless Crawler](https://endlesscrawler.io/) SDK Monorepo

[@ EndlessCrawler](https://twitter.com/EndlessCrawler)

## SDK structure

**EARLY ALPHA**

Things still changing and breaking.

| Packages                  |            |                  |                      | Status  |
|---------------------------|------------|------------------|----------------------|---------|
| @avante/crawler-core      | Typescript | off-chain        | types and api        | alpha   |
| @avante/crawler-data      | Typescript | off-chain        | cached map data      | alpha   |
| @avante/crawler-api       | Typescript | on-chain         | web3 api             | alpha   |
| @avante/crawler-react     | React      | on/off-chain     | components and hooks | planned |
| @avante/crawler-contracts | Sol/Cairo  | on-chain         | contracts and abi    | planned |

| Apps                      |            |                  |                      | Status  |
|---------------------------|------------|------------------|----------------------|---------|
| /apps/sdk-explorer        | Next.js    | on-chain         | sdk examples         | alpha   |




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
pnpm -r run build
pnpm -r run test
pnpm -r run update
pnpm -r run lint
```


#### To execute a script/task on specific packages...

> [filtering](https://pnpm.io/filtering)

```sh
# multiple packages
pnpm --filter "@avante/*" test
pnpm --filter "@avante/*" update -D typescript

# single package
pnpm --filter sdk-explorer build
pnpm --filter "@avante/crawler-api" test
pnpm --filter "*/crawler-api" test
pnpm --filter "*api" update -D typescript
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




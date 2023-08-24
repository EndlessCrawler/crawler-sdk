# crawler-sdk

Endless Crawler SDK Monorepo

## Included Packages

**EARLY ALPHA**. Use with caution, anything can change and break at any time.

In development:

* `@avante/crawler-data` : Game data and tools
* `@avante/crawler-api` : Web3 API, contracts ABI
* `@avante/crawler-explorer` : Data explorer, examples, cacher

Planned:

* `@avante/crawler-react` : React framework (off-chain, ready to use)
* `@avante/crawler-react3` : React framework (on-chain, need web3 wallet)
* `@avante/crawler-contracts` : Solidity contracts



## Which package should I get?


| Package                   |            |                  |
|---------------------------|------------|------------------|
| @avante/crawler-data      | Typescript | off-chain        |
| @avante/crawler-react     | React      | off-chain        |
| @avante/crawler-api       | Typescript | web3 / on-chain  |
| @avante/crawler-react3?   | React      | web3 / on-chain  |
| @avante/crawler-explorer  | Next.js    | web3 / on-chain  |




## Monorepo workflow

This is a **monorepo**, a single repository containing multiple packages. We use [Lerna](https://lerna.js.org/docs/introduction) and [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) to manage it.

There is no reason to download this repository unless you want to contribute. As an SDK user, better [choose](#included-packages) one of the included packages instead.


#### Initialize this monorepo after download

```sh
npm install
npx lerna init
npx lerna link
npx lerna run build
```


#### Execute a **task** (package scripts) on all packages...

```sh
# on all packages
npx lerna run build
npx lerna run test
npx lerna run test,build,lint

# on a single package
npx lerna run test --scope=crawler-data
```

#### Execute a **command** on all packages...

```sh
# on all packages
npx lerna exec npm install
npx lerna exec "npm update --save"

# on a single package
npx lerna exec npm install --scope=crawler-data
```




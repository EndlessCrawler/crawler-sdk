# crawler-monorepo

Endless Crawler SDK

## Included Packages

**EARLY ALPHA**. Use with caution, anything can change and break at any time.

In development:

* `@avante/crawler-data` : Game data and tools
* `@avante/crawler-api` : Web3 API, contracts ABI
* `@avante/crawler-explorer` : Data explorer, examples, cacher

Planned:

* `@avante/crawler-react` : React framework (off-chain, ready to use)
* `@avante/crawler-web3` : React framework (on-chain, need web3 wallet)
* `@avante/crawler-contracts` : Solidity contracts



## Which package should I get?


| Package                   |            |                  |
|---------------------------|------------|------------------|
| @avante/crawler-data      | Typescript | off-chain        |
| @avante/crawler-react     | React      | off-chain        |
| @avante/crawler-web3      | Typescript | web3 / on-chain  |
| @avante/crawler-react ?   | React      | web3 / on-chain  |
| @avante/crawler-explorer  | Next.js    | web3 / on-chain  |




## Monorepo workflow

This is a **monorepo**, a single repository containing multiple packages.

We use [Lerna](https://lerna.js.org/docs/introduction) to manage it.

Execute a task on all packages...

```sh
# on all packages
npx lerna run build
npx lerna run test
npx lerna run test,build,lint

# on a single package
npx lerna run test --scope=crawler-data

```



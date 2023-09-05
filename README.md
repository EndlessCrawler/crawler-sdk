# crawler-sdk

[Endless Crawler](https://endlesscrawler.io/) SDK Monorepo

[@ EndlessCrawler](https://twitter.com/EndlessCrawler)

## SDK structure

**EARLY ALPHA**

Things can change and break at any time.

#### Packages in development

* `@avante/crawler-data` : Game data and tools
* `@avante/crawler-api` : Web3 API, contracts ABI
* `@avante/crawler-explorer` : Data explorer, examples, cacher

#### Planned

* `@avante/crawler-react` : React framework (off-chain/on-chain, ready to use)
* `@avante/crawler-contracts` : Solidity contracts



## Which package should I get?


| Package                   |            |                  |                  |
|---------------------------|------------|------------------|------------------|
| @avante/crawler-data      | Typescript | off-chain        | just cached data |
| @avante/crawler-core      | Typescript | off-chain        | chamber access api |
| @avante/crawler-web3      | Typescript | on-chain         |  |
| @avante/crawler-react     | React      | on/off-chain     |  |
| @avante/crawler-explorer  | Next.js    | on-chain         | api explorer |




## Monorepo workflow

This is a **monorepo**, a single repository containing multiple packages. We use [Lerna](https://lerna.js.org/docs/introduction) and [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) to manage it.

There is no reason to download this repository unless you want to contribute. As an SDK user, better [choose](#included-packages) one of the included packages instead.


#### Initialize this monorepo after download

```sh
npm install
npx lerna init
npx lerna link
npx lerna run build  # or: npm run _build
```


#### Execute a **task** (package scripts) on all packages...

```sh
# on all packages
npx lerna run build  # or: npm run _build
npx lerna run test   # or: npm run _test
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

#### Watch Typescript changes and recompile...

```sh
# recompile all TS packages on changes
npm run watch
# recompile and run tests
npm run watchtest
# og way
npx lerna watch -- npx lerna run build
```




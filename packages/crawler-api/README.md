# crawler-api

[Endless Crawler](https://endlesscrawler.io/) on-chain contract layer — a **pure contract interface** over [viem 2](https://viem.sh/): fully-typed contract instances and parsed-result helpers. It talks to contracts and delivers decoded values; it holds no game logic and converts nothing (callers convert — see `@avante/crawler-data`).

**WARNING**: alpha — things are still changing and can break at any time.

```
npm install @avante/crawler-api @avante/crawler-core
```

## RPC

Every factory takes an optional caller-supplied `rpcUrl` (provider-agnostic — there is no global registry and no baked-in provider). When omitted, viem's default public RPC for the chain is used **with a `console.warn`** — fine for a quick look, supply your own for real use. The chain always comes from the world binding or the caller; there is no default chain.

## World contract

A fully-typed viem contract instance from a `World`'s contract binding — the ABI is resolved by `world.contractName`, address and chain come from the binding:

```ts
import { loadWorld, type World } from '@avante/crawler-core';
import { mainnetWorld } from '@avante/crawler-data';
import { contractAbis, getWorldContract, type TypedContract } from '@avante/crawler-api';

const world: World = loadWorld(mainnetWorld);
const contract: TypedContract<typeof contractAbis.CrawlerToken> = getWorldContract(world, {
  rpcUrl: process.env.MAINNET_RPC_URL,
});

// every read is typed by the as-const ABI
const totalSupply: bigint = await contract.read.totalSupply();
const tokenUri: string = await contract.read.tokenURI([123n]);
const coord: bigint = await contract.read.tokenIdToCoord([123n]); // packed coord

// the pipeline's on-chain seed supplement — the Crawl.ChamberSeed struct, decoded
const chamberSeed: {
  tokenId: bigint;
  seed: bigint;
  yonder: bigint;
  chapter: number;
  terrain: number;
  entryDir: number;
} = await contract.read.coordToSeed([coord]);
```

## Parsed-result helpers

World-bound reads with the parsing done — raw metadata out, the caller converts:

```ts
import type { HexString } from '@avante/crawler-core';
import {
  readOwnerOf,
  readTokenMetadata,
  readTotalSupply,
  type TokenMetadata,
} from '@avante/crawler-api';

const totalSupply: bigint = await readTotalSupply(world, { rpcUrl });
const owner: HexString = await readOwnerOf(world, 1, { rpcUrl }); // checksummed; token ids are BigIntish

// tokenURI fetched and its data-URI unpacked: metadata JSON with the `image`
// blob lifted out and delivered decoded as `svg`
const token: TokenMetadata = await readTokenMetadata(world, 1, { rpcUrl });
const metadata: Record<string, unknown> = token.metadata;
const svg: string = token.svg;
```

## Other contracts

Addresses and chain ids crossing the api surface are `BigIntish` (hex string, bigint, number…) — conversion to viem's `Address` happens inside:

```ts
import { erc20Abi, erc721Abi } from 'viem';
import {
  contractAbis,
  getCardsContract,
  getContractAbi,
  getErc20,
  getErc721,
  getTypedContract,
  type TypedContract,
} from '@avante/crawler-api';

// the EndlessCrawler Cards contract (CardsMinter), typed by its bundled ABI
const cards: TypedContract<typeof contractAbis.CardsMinter> = getCardsContract({
  chainId: 1,
  contractAddress,
  rpcUrl,
});
const cardBalance: bigint = await cards.read.balanceOf([owner, tokenId]);

// generic standard contracts — bundled ERC-20/ERC-721 ABIs (viem's), you supply only the address
const erc20: TypedContract<typeof erc20Abi> = getErc20({ chainId: 1, contractAddress, rpcUrl });
const erc721: TypedContract<typeof erc721Abi> = getErc721({ chainId: 1, contractAddress, rpcUrl });

// arbitrary contracts take an explicit ABI — any bundled one resolves by name, fully typed
const index: TypedContract<typeof contractAbis.CrawlerIndex> = getTypedContract({
  chainId: 1,
  contractAddress,
  abi: getContractAbi('CrawlerIndex'),
  rpcUrl,
});
```

## ABI registry

The bundled ABIs of every live Endless Crawler contract, keyed by contract name (`KnownContractName`): `CrawlerToken`, `CardsMinter`, `CrawlerIndex`, `CrawlerPlayer`, `CrawlerQueryV1`, `CrawlerGeneratorV1`, `CrawlerMapperV1`, `CrawlerRendererV1`.

```ts
import {
  contractAbis,
  getAllContractNames,
  getContractAbi,
  type KnownContractName,
} from '@avante/crawler-api';

const names: KnownContractName[] = getAllContractNames(); // ['CardsMinter', ..., 'CrawlerToken']

// const-asserted ABI, typed by name; an unknown name throws UnknownContractError
const abi: typeof contractAbis.CrawlerToken = getContractAbi('CrawlerToken');
```

ABIs are sourced from the committed artifact JSON (`src/artifacts/`) and codegen'd into const-asserted TS (`src/generated/`, git-ignored) by the package's `gen` script — it runs automatically before every build/typecheck/test.

## Client

```ts
import type { PublicClient } from 'viem';
import { getPublicClient } from '@avante/crawler-api';

const client: PublicClient = getPublicClient(1, rpcUrl); // cached per chainId:rpcUrl
```

Supported chains: mainnet (`1`), goerli (`5`), sepolia (`11155111`); anything else throws `UnsupportedChainError`.

## Canonical serializer

`formatViewData` is the canonical dataset serializer (the package's one non-contract member) — every views-data create/update goes through it, so files are byte-stable across regenerations. Compact and human-readable; bigints handled locally (no `BigInt.prototype` monkeypatch).

```ts
import { formatViewData } from '@avante/crawler-api';

const json: string = await formatViewData({ coord: 123n, doors: [1n, 2n, 3n] });
```

## Errors

Typed, documented per throw site (`@throws` in the TSDoc): `UnknownContractError` (no bundled ABI for the name), `UnsupportedChainError` (no viem chain for the id), `InvalidTokenMetadataError` (a tokenURI payload that can't be unpacked).

---

Specified by [`specs/SDK_SPECS.md`](../../specs/SDK_SPECS.md) §`crawler-api`. Event listeners (live watcher) and owner helpers are planned — they land with the SDK refactor's later phases.

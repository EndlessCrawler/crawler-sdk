import {
  type ChamberData,
  type Converter,
  createCrawler,
  type Crawler,
  Dir,
  type ec,
  offsetCoord,
  type WorldJson,
} from '@avante/crawler-core';
import type { ReactNode } from 'react';
import { CrawlerProvider } from '../src';

/** S1W1 — the mainnet genesis chamber's coord */
export const COORD = 18446744073709551617n;
/** one chamber north of {@link COORD} (N1W1) */
export const NORTH_COORD = offsetCoord(COORD, Dir.North);

/** a converter test double: the payload IS the ChamberData record */
export const testConverter: Converter<typeof ec, ChamberData<typeof ec>> = {
  schema: 'ec',
  convert: (tokenId, payload) => ({ chamberData: payload, svg: `<svg>token ${tokenId}</svg>` }),
};

/** a minimal, valid `ec` world: one token placing one chamber, with its SVG */
export const makeWorldJson = (name = 'testworld'): WorldJson => ({
  worldInfo: {
    name,
    network: 'ethereum',
    chainId: 1,
    contractAddress: '0x8E70b94C57b0CBC9807c0F58Bc251f4cD96AcDb0',
    contractName: 'CrawlerToken',
    schema: 'ec',
    timestamp: '2026-07-18T00:00:00.000Z',
  },
  tokenCoord: {
    '1': COORD.toString(),
  },
  chamberData: {
    [COORD.toString()]: {
      coord: COORD.toString(),
      tokenId: 1,
      name: 'Chamber #1',
      compass: { west: 1, south: 1 },
      terrain: 'earth',
      yonder: 1,
      seed: '0x01',
      tilemap: [0, 255, 2],
      doors: [
        {
          tile: 11,
          destCoord: NORTH_COORD.toString(),
          destTile: 251,
          direction: 'North',
          isEntry: true,
        },
        {
          tile: 245,
          destCoord: offsetCoord(COORD, Dir.South).toString(),
          destTile: 5,
          direction: 'South',
          isLocked: true,
        },
      ],
      isDynamic: true,
      attributes: { chapter: 1, gemType: 'silver', gemPos: 42, coins: 40, worth: 90 },
    },
  },
  tokenSvg: {
    '1': '<svg>token 1</svg>',
  },
});

/** the converted record for token 2, one chamber north of the genesis chamber */
export const makeNorthChamber = (): ChamberData<typeof ec> => ({
  coord: NORTH_COORD,
  tokenId: 2n,
  name: 'Chamber #2',
  compass: { north: 1n, west: 1n },
  terrain: 'water',
  yonder: 2,
  seed: 2n,
  tilemap: [0, 255],
  doors: [
    {
      tile: 251,
      destCoord: COORD,
      destTile: 11,
      direction: Dir.South,
      isEntry: true,
    },
  ],
  attributes: { chapter: 1, gemType: 'gold', gemPos: 40, coins: 10, worth: 20 },
});

/** a fresh single-world crawler with the test converter bundled */
export const makeCrawler = (): Crawler =>
  createCrawler([{ world: makeWorldJson(), converter: testConverter }]);

/** a `renderHook`/`render` wrapper around `CrawlerProvider` */
export const makeWrapper = (
  crawler: Crawler,
  props: { defaultWorld?: string } = {},
): (({ children }: { children: ReactNode }) => ReactNode) => {
  return ({ children }: { children: ReactNode }) => (
    <CrawlerProvider crawler={crawler} {...props}>
      {children}
    </CrawlerProvider>
  );
};

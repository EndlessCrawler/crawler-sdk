import { Dir, offsetCoord, type WorldJson } from '../src';

/** S1W1 — the mainnet genesis chamber's coord */
export const COORD = 18446744073709551617n;
/** one chamber north of {@link COORD} (N1W1) */
export const NORTH_COORD = offsetCoord(COORD, Dir.North);
/** one chamber south of {@link COORD} (S2W1) */
export const SOUTH_COORD = offsetCoord(COORD, Dir.South);

/** a minimal, valid `ec` world: one token placing one dynamic chamber */
export const makeWorldJson = (): WorldJson => ({
  worldInfo: {
    name: 'testworld',
    network: 'ethereum',
    chainId: 1,
    contractAddress: '0x8E70b94C57b0CBC9807c0F58Bc251f4cD96AcDb0',
    contractName: 'CrawlerToken',
    schema: 'ec',
    timestamp: '2026-07-14T00:00:00.000Z',
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
          destCoord: SOUTH_COORD.toString(),
          destTile: 5,
          direction: 'South',
          isLocked: true,
        },
      ],
      isDynamic: true,
      attributes: { chapter: 1, gemType: 'silver', gemPos: 42, coins: 40, worth: 90 },
    },
  },
});

import { useMemo } from 'react';
import { BigIntIsh, Dir, ModuleInterface, Utils } from '@avante/crawler-core';
import { useCrawler } from './useCrawler';

export const useSideCoords = <T extends ModuleInterface>(coord: BigIntIsh): bigint[] | null => {
  const { client } = useCrawler<T>();
  const sideCoords = useMemo(() => {
    const _coord = Utils.toBigInt(coord);
    return _coord ? client.chamberDirections.map((d: Dir) => client.offsetCoord(_coord, d)) : null;
  }, [coord]);
  return sideCoords;
};

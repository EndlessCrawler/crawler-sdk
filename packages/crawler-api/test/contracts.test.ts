import { beforeAll, describe, expect, it } from 'vitest';
import {
  EndlessCrawler,
  createClient,
  // ---
  ContractName,
  ViewName,
} from '@avante/crawler-core';
import { allDataSets } from '@avante/crawler-data';
import { getAllContractNames, getContractAddress } from '../src';

describe('* contracts', () => {
  let client: EndlessCrawler.Module;

  beforeAll(() => {
    client = createClient(allDataSets) as EndlessCrawler.Module;
  });

  it('exposes contract names', () => {
    expect(getAllContractNames()).toContain(ContractName.CrawlerToken);
  });

  it('validate views contract addresses', () => {
    // Each imported DataSet carries its own chainId; every view's metadata must
    // resolve to the same contract address that getContractAddress() reports.
    const dataSetNames = client.getDataSetNames();
    expect(dataSetNames.length).toBeGreaterThan(0);

    for (const dataSetName of dataSetNames) {
      const views = client.getAllViews({ dataSetName });
      const viewNames = Object.keys(views) as ViewName[];
      expect(viewNames.length).toBeGreaterThan(0);

      for (const viewName of viewNames) {
        const { metadata } = views[viewName];
        const contractName = metadata.contractName as ContractName;
        const contractAddress = getContractAddress(contractName, metadata.chainId);
        expect(contractAddress, `${dataSetName}/${viewName}`).toBe(metadata.contractAddress);
      }
    }
  });
});

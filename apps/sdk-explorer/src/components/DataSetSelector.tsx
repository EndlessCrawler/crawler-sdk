'use client';

import { useCrawler, useDataSets } from '@avante/crawler-react';

export default function DataSetSelector() {
  const { client } = useCrawler();
  const { currentDataSetName, dataSetNames } = useDataSets();

  const selectDataSet = (dataSetName: string) => {
    client.setCurrentDataSet({ dataSetName });
  };

  return (
    <div>
      dataset:{' '}
      <select value={currentDataSetName ?? ''} onChange={(e) => selectDataSet(e.target.value)}>
        {dataSetNames.map((dataSetName) => (
          <option value={dataSetName} key={dataSetName}>
            {dataSetName}
          </option>
        ))}
      </select>
    </div>
  );
}

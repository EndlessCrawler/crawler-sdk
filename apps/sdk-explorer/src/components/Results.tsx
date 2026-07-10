'use client';

import { useQuery } from '@tanstack/react-query';
import { CopyIcon, LinkIcon, LoadingIcon } from '@/components/Icons';
import MonacoEditor from '@/components/MonacoEditor';
import { useSelection } from '@/hooks/SelectionContext';

export default function Results() {
  const { selection } = useSelection();
  const url = selection?.kind === 'url' ? selection.url : null;
  const name = selection?.kind === 'data' ? selection.name : null;

  const { data, error, isFetching } = useQuery({
    queryKey: ['fetch', url],
    queryFn: async () => {
      const response = await fetch(url as string);
      if (!response.ok) {
        throw new Error(`[${response.status}] (${response.statusText}): ${await response.text()}`);
      }
      return response.json();
    },
    enabled: url !== null,
  });

  const results =
    selection === null
      ? {}
      : selection.kind === 'data'
        ? selection.data
        : isFetching
          ? '...'
          : error
            ? `${error}`
            : data;

  // bigint renders as { hex, number } in the editor (as in the original explorer)
  const jsonResults =
    typeof results === 'bigint'
      ? { hex: `0x${results.toString(16)}`, number: `${results.toString()}n` }
      : results;

  const summary = isFetching
    ? 'Fetching...'
    : Array.isArray(results)
      ? `Array size: ${results.length}`
      : typeof results === 'object' && results !== null
        ? `Dict size: ${Object.keys(results).length}`
        : typeof results;

  return (
    <div className="fill-parent p-2">
      <div className="url-line">
        <LinkIcon url={url} /> {url ?? name}
      </div>

      <div className="url-line">
        {isFetching ? <LoadingIcon /> : <CopyIcon content={JSON.stringify(results)} />} {summary}
      </div>

      <MonacoEditor content={jsonResults} />
    </div>
  );
}

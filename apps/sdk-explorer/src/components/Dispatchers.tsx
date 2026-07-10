'use client';

import { useMutation } from '@tanstack/react-query';
import { useSelection } from '@/hooks/SelectionContext';

//---------------------------------------------------------
// Select a URL for the Results panel to fetch
//
function UrlDispatcher({ label, url, br = true }: { label: string; url: string; br?: boolean }) {
  const { setSelection } = useSelection();
  return (
    <>
      <button type="button" className="anchor" onClick={() => setSelection({ kind: 'url', url })}>
        {label}
      </button>
      {br && <br />}
    </>
  );
}

//---------------------------------------------------------
// Select any arbitrary DATA for the Results panel to display
//
function DataDispatcher({
  label,
  data,
  br = true,
}: {
  label: string;
  data: unknown;
  br?: boolean;
}) {
  const { setSelection } = useSelection();
  return (
    <>
      <button
        type="button"
        className="anchor"
        onClick={() => setSelection({ kind: 'data', name: label, data })}
      >
        {label}
      </button>
      {br && <br />}
    </>
  );
}

//---------------------------------------------------------
// Select the (synchronous) result of an action
//
function ActionDispatcher({
  label,
  onAction,
  br = true,
}: {
  label: string;
  onAction(): unknown;
  br?: boolean;
}) {
  const { setSelection } = useSelection();
  return (
    <>
      <button
        type="button"
        className="anchor"
        onClick={() => setSelection({ kind: 'data', name: label, data: onAction() })}
      >
        {label}
      </button>
      {br && <br />}
    </>
  );
}

//---------------------------------------------------------
// Select the (async) result of an action
//
function AsyncActionDispatcher({
  label,
  onAction,
  br = true,
}: {
  label: string;
  onAction(): Promise<unknown>;
  br?: boolean;
}) {
  const { setSelection } = useSelection();
  const { mutate, isPending } = useMutation({
    mutationFn: onAction,
    onMutate: () => setSelection({ kind: 'data', name: label, data: '...' }),
    onSuccess: (data) => setSelection({ kind: 'data', name: label, data }),
    onError: (error) => setSelection({ kind: 'data', name: label, data: { error: `${error}` } }),
  });

  return (
    <>
      <button type="button" className="anchor" onClick={() => !isPending && mutate()}>
        {label}
      </button>
      {br && <br />}
    </>
  );
}

export { ActionDispatcher, AsyncActionDispatcher, DataDispatcher, UrlDispatcher };

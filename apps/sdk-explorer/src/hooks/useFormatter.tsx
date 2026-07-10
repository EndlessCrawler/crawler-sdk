'use client';

import { formatViewData } from '@avante/crawler-api';
import { useEffect, useState } from 'react';

// Formats arbitrary data (incl. bigint) to a JSON string for the Monaco view,
// via crawler-api's prettier-based formatViewData (async, hence the effect).
export const useFormatter = (content: unknown) => {
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    let _mounted = true;
    const _format = async () => {
      const result = await formatViewData(content);
      if (_mounted) {
        setFormatted(result);
      }
    };
    _format();
    return () => {
      _mounted = false;
    };
  }, [content]);

  return { formatted };
};

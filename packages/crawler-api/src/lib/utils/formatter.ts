// The canonical dataset serializer (see specs/SDK_SPECS.md §Canonical serialization).
// Every views-data create/update goes through it, so files are byte-stable across
// regenerations. Output is compact and human-readable — JSON.stringify(…, 2) is
// banned for datasets (it explodes door/lock arrays one element per line).
//
// Layout comes from @avante/crawler-utils' formatJSON (zero-dep, byte-identical to
// the former prettier-JSON output); this wrapper keeps the historical scalar/empty
// short-circuits (a bare string passes through; a non-object stringifies).
import { formatJSON } from '@avante/crawler-utils/format';

export const formatViewData = (data: unknown = {}): string => {
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data !== 'object' || data == null) {
    return String(data);
  }
  return formatJSON(data);
};

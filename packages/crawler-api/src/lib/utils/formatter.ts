// The canonical dataset serializer (see specs/SDK_SPECS.md §Canonical serialization).
// Every views-data create/update goes through it, so files are byte-stable across
// regenerations. Output is compact and human-readable — JSON.stringify(…, 2) is
// banned for datasets (it explodes door/lock arrays one element per line).
//
// https://prettier.io/docs/en/api
// https://prettier.io/docs/en/browser.html
import * as prettier from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';

// bigint handling is local to the formatter — no BigInt.prototype.toJSON
// monkeypatch (the package declares sideEffects: false)
const _bigIntReplacer = (_key: string, value: unknown): unknown =>
  typeof value === 'bigint'
    ? value <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(value)
      : value.toString()
    : value;

export const formatViewData = async (data: unknown = {}): Promise<string> => {
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data !== 'object' || data == null) {
    return String(data);
  }

  const options = {
    useTabs: true,
    tabWidth: 2,
    printWidth: 80,
    parser: 'json',
    plugins: [prettierPluginBabel, prettierPluginEstree],
  };

  return await prettier.format(JSON.stringify(data, _bigIntReplacer), options);
};

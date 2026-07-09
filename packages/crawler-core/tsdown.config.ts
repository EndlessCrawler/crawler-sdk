import { defineConfig } from 'tsdown';

export default defineConfig({
  // "." is the public API; "./internal" exposes the __-prefixed dataset-importer plumbing that
  // @avante/crawler-data (and its tests) need — kept off the public root surface deliberately.
  entry: ['src/index.ts', 'src/modules/importer.ts'],
  format: 'esm',
  // package.json is "type":"module", so plain .js/.d.ts are ESM — don't force .mjs/.d.mts.
  fixedExtension: false,
  dts: true,
  clean: true,
});

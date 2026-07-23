import { defineConfig } from 'tsdown';

export default defineConfig({
  // Multi-entry: one bundle per subpath (mirrors crawler-data) so a consumer bundles
  // only what it imports. js-sha3 is bundled into the /seeder chunk (a devDependency),
  // keeping the published package zero-runtime-dep.
  entry: [
    'src/index.ts',
    'src/bi/index.ts',
    'src/format/index.ts',
    'src/encode/index.ts',
    'src/seeder/index.ts',
  ],
  format: 'esm',
  // package.json is "type":"module", so plain .js/.d.ts are ESM — don't force .mjs/.d.mts.
  fixedExtension: false,
  dts: true,
  clean: true,
});

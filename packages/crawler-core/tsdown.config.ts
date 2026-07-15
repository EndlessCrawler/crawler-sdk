import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  // package.json is "type":"module", so plain .js/.d.ts are ESM — don't force .mjs/.d.mts.
  fixedExtension: false,
  dts: true,
  clean: true,
});

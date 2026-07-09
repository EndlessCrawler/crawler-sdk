import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: 'esm',
  fixedExtension: false,
  dts: true,
  clean: true,
});

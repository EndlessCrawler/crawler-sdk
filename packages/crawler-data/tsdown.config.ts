import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/mainnet.ts', 'src/goerli.ts'],
  format: 'esm',
  fixedExtension: false,
  dts: true,
  clean: true,
});

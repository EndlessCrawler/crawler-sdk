import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve sibling @avante packages to source so tests run without a prior build.
// crawler-data's source itself imports @avante/crawler-core, so that alias is
// needed transitively. Bare-package aliases are anchored (`$`).
const src = (pkg: string, p: string) =>
  fileURLToPath(new URL(`../${pkg}/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@avante\/crawler-core$/, replacement: src('crawler-core', 'index.ts') },
      { find: /^@avante\/crawler-data$/, replacement: src('crawler-data', 'index.ts') },
      { find: /^@avante\/crawler-data\/mainnet$/, replacement: src('crawler-data', 'mainnet.ts') },
      { find: /^@avante\/crawler-data\/goerli$/, replacement: src('crawler-data', 'goerli.ts') },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

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
      { find: /^@avante\/crawler-utils\/bi$/, replacement: src('crawler-utils', 'bi/index.ts') },
      {
        find: /^@avante\/crawler-utils\/format$/,
        replacement: src('crawler-utils', 'format/index.ts'),
      },
      {
        find: /^@avante\/crawler-utils\/encode$/,
        replacement: src('crawler-utils', 'encode/index.ts'),
      },
      {
        find: /^@avante\/crawler-utils\/seeder$/,
        replacement: src('crawler-utils', 'seeder/index.ts'),
      },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

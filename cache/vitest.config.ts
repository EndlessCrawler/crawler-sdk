import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve @avante/* to source so the invariant test runs without a prior build.
// The bare package aliases are anchored (`$`).
const src = (pkg: string, entry: string) =>
  fileURLToPath(new URL(`../packages/${pkg}/src/${entry}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@avante\/crawler-core$/, replacement: src('crawler-core', 'index.ts') },
      { find: /^@avante\/crawler-data$/, replacement: src('crawler-data', 'index.ts') },
      { find: /^@avante\/crawler-data\/mainnet$/, replacement: src('crawler-data', 'mainnet.ts') },
      { find: /^@avante\/crawler-data\/goerli$/, replacement: src('crawler-data', 'goerli.ts') },
      { find: /^@avante\/crawler-api$/, replacement: src('crawler-api', 'index.ts') },
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

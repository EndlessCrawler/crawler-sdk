import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve @avante/crawler-utils subpaths to source so tests run without a prior build.
const utilsSrc = (p: string) =>
  fileURLToPath(new URL(`../crawler-utils/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@avante\/crawler-utils\/bi$/, replacement: utilsSrc('bi/index.ts') }],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

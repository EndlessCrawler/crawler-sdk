import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve @avante/crawler-core to source so tests run without a prior build.
const coreSrc = (p: string) => fileURLToPath(new URL(`../crawler-core/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@avante\/crawler-core$/, replacement: coreSrc('index.ts') }],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

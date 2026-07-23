import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve @avante/crawler-core to source so tests run without a prior build.
// The bare package alias is anchored (`$`).
const coreSrc = (p: string) => fileURLToPath(new URL(`../crawler-core/src/${p}`, import.meta.url));
// core's source imports @avante/crawler-utils/bi, so that alias is needed transitively.
const utilsSrc = (p: string) =>
  fileURLToPath(new URL(`../crawler-utils/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@avante\/crawler-core$/, replacement: coreSrc('index.ts') },
      { find: /^@avante\/crawler-utils\/bi$/, replacement: utilsSrc('bi/index.ts') },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

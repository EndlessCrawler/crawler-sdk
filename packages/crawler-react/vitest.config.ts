import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve sibling @avante packages to source so tests run without a prior build
// (crawler-api is the optional peer the live-path tests mock; its source pulls
// crawler-core transitively). Bare-package aliases are anchored (`$`).
const src = (pkg: string, p: string) =>
  fileURLToPath(new URL(`../${pkg}/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@avante\/crawler-core$/, replacement: src('crawler-core', 'index.ts') },
      { find: /^@avante\/crawler-api$/, replacement: src('crawler-api', 'index.ts') },
    ],
  },
  test: {
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    environment: 'jsdom',
  },
});

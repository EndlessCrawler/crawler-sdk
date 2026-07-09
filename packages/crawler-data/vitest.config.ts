import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve @avante/crawler-core to source so tests run without a prior build.
// The bare package alias is anchored (`$`) so it can't swallow the `./internal`
// subpath; `/internal` is listed first and matched before the bare name.
// (The CrawlerModules singleton lives on globalThis, so the two entry points
// resolving to distinct module instances is harmless — same as the old jest shim.)
const coreSrc = (p: string) => fileURLToPath(new URL(`../crawler-core/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: '@avante/crawler-core/internal', replacement: coreSrc('modules/importer.ts') },
      { find: /^@avante\/crawler-core$/, replacement: coreSrc('index.ts') },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Resolve sibling @avante packages to source so tests run without a prior build.
// crawler-data's source itself imports @avante/crawler-core[/internal], so those
// aliases are needed transitively. Bare-package aliases are anchored (`$`) so they
// can't swallow the `./internal` subpath, which is matched first.
const src = (pkg: string, p: string) =>
  fileURLToPath(new URL(`../${pkg}/src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@avante/crawler-core/internal',
        replacement: src('crawler-core', 'modules/importer.ts'),
      },
      { find: /^@avante\/crawler-core$/, replacement: src('crawler-core', 'index.ts') },
      { find: /^@avante\/crawler-data$/, replacement: src('crawler-data', 'index.ts') },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});

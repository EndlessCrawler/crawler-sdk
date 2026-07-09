/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // preset: 'ts-jest',
  // preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }],
  },
  // This jest resolver doesn't honor `exports` subpaths; map core's "./internal" handle to source
  // (the CrawlerModules singleton lives on globalThis, so a second module instance is harmless).
  // Removed in V2 Phase 3 — Vitest resolves the subpath export natively.
  moduleNameMapper: {
    '^@avante/crawler-core/internal$': '<rootDir>/../crawler-core/src/modules/importer.ts',
  },
  testPathIgnorePatterns: ['./dist'],
  setupFilesAfterEnv: ['jest-expect-message'],
  testTimeout: 10000,
  verbose: true,
  silent: false,
};

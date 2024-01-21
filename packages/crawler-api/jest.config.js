/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	// preset: 'ts-jest',
	// preset: 'ts-jest/presets/js-with-ts',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	verbose: true,
	transform: {
		'^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }]
	},
	testPathIgnorePatterns: ['./dist'],
	setupFilesAfterEnv: ['jest-expect-message'],
	testTimeout: 10000,
	verbose: true,
}

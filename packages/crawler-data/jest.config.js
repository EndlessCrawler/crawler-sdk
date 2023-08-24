/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	// preset: 'ts-jest',
	preset: 'ts-jest/presets/js-with-ts',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['jest-expect-message'],
}

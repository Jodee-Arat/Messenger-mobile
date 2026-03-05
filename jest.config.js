/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	rootDir: '.',
	testMatch: ['<rootDir>/app/**/*.spec.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/app/$1'
	},
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
				diagnostics: false
			}
		]
	},
	transformIgnorePatterns: [
		'node_modules/(?!(@react-native|react-native|expo|zustand)/)'
	]
}

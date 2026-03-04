// @ts-check
import js from '@eslint/js'
import ts from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import pluginUnusedImports from 'eslint-plugin-unused-imports'

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	{
		plugins: {
			'unused-imports': pluginUnusedImports,
		},
		languageOptions: {
			sourceType: 'commonjs',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'no-duplicate-imports': 'error',
			'object-curly-spacing': 'off',
			'@typescript-eslint/no-explicit-any': 'error',
			'no-multi-spaces': 'off',
			quotes: 'off',
			'no-tabs': 'off',
			'require-jsdoc': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			semi: ['error', 'never'],
			'unused-imports/no-unused-imports': 'error',
			'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
			'max-lines': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
			'max-len': ['error', { code: 120 }],
			'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'no-warning-comments': 'off',
			'no-console': 'warn',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/typedef': [
				'error',
				{
					variableDeclaration: true,
					propertyDeclaration: true,
				},
			],
		},
	},
	{
		files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
		plugins: { 'unused-imports': pluginUnusedImports },
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'max-lines': ['error', { max: 1000, skipBlankLines: true, skipComments: true }],
			'max-lines-per-function': 'off',
		},
	},
	{
		ignores: ['node_modules', 'dist', 'coverage', 'eslint.config.mjs'],
	},
	prettier,
]

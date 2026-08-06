import cleanCodePlugin from './two-blank-lines-between-functions.cjs';

export default [
  {
    ignores: [
      '.git/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      'clean-code': cleanCodePlugin,
    },
    rules: {
      camelcase: ['error', {
        properties: 'never',
        ignoreDestructuring: false,
      }],
      complexity: ['error', 5],
      'max-depth': ['error', 2],
      'max-lines': ['error', {
        max: 400,
        skipBlankLines: true,
        skipComments: true,
      }],
      'max-lines-per-function': ['error', {
        max: 14,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true,
      }],
      'max-nested-callbacks': ['error', 2],
      'max-params': ['error', 3],
      'max-statements': ['error', 10],
      'no-duplicate-imports': 'error',
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'clean-code/two-blank-lines-between-functions': 'error',
    },
  },
  {
    files: ['quality/**/*.test.cjs'],
    rules: {
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'clean-code/two-blank-lines-between-functions': 'off',
    },
  },
];

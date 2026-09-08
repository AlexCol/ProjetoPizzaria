const { defineConfig, globalIgnores } = require('eslint/config');

const prettier = require('eslint-config-prettier/flat');
const expo = require('eslint-config-expo/flat');
const unusedImports = require('eslint-plugin-unused-imports');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  globalIgnores(['.expo/**', 'android/**', 'coverage/**', 'dist/**', 'ios/**', 'node_modules/**']),

  expo,

  {
    files: ['**/*.{ts,tsx}'],

    extends: [tseslint.configs.recommended],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    plugins: {
      'unused-imports': unusedImports,
    },

    rules: {
      'no-console': 'warn',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'no-duplicate-imports': 'error',

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',

      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },

  prettier,
]);

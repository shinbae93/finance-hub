import { FlatCompat } from '@eslint/eslintrc';
import nxEslintPlugin from '@nx/eslint-plugin';
import js from '@eslint/js';
// Filter out rules not supported by eslint v8 (e.g. no-unassigned-vars from @eslint/js v10)
const safeRecommended = {
  ...js.configs.recommended,
  rules: Object.fromEntries(
    Object.entries(js.configs.recommended.rules ?? {}).filter(
      ([key]) =>
        !['no-unassigned-vars', 'no-useless-assignment', 'preserve-caught-error'].includes(key),
    ),
  ),
};
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: safeRecommended,
});

export default [
  { plugins: { '@nx': nxEslintPlugin } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:api-lib'],
            },
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:web-lib'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:web-lib',
              onlyDependOnLibsWithTags: ['scope:web-lib'],
            },
            {
              sourceTag: 'scope:api-lib',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:api-lib'],
            },
          ],
        },
      ],
    },
  },
  ...compat.config({ extends: ['plugin:@nx/typescript'] }).map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
    rules: { ...config.rules },
  })),
  ...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
    rules: { ...config.rules },
  })),
  {
    ignores: ['**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
];

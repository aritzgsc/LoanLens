import base from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
export default [
  { ignores: ['dist/**', '.astro/**', '.lighthouseci/**', '**/*.d.ts'] },
  { ...base.configs.recommended, files: ['**/*.js', '**/*.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  ...tseslint.configs.recommended
];

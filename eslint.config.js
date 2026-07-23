import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Non-type-checked config on purpose: keeps CI fast and does NOT enable
// type-aware rules (e.g. no-floating-promises), which the benchmark's planted
// bugs rely on staying un-linted on the seed.
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);

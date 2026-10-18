import eslintNextPlugin from '@next/eslint-plugin-next';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  nextTs,
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      next: eslintNextPlugin,
    },
    settings: {
      // Explicit version: eslint-plugin-react's auto-detection calls
      // context.getFilename(), removed in ESLint 10, and crashes the run
      react: { version: '19.2' },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // The base rule reports parameter names in TS function types;
      // the TypeScript-aware rule replaces it
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    // Node CommonJS scripts and Jest module mocks legitimately use require()
    files: ['scripts/**/*.js', '**/__tests__/**'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'prisma/**',
    'build/**',
    'src/assets/image/**',
    'next-env.d.ts',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;

// {
//   "extends": ["next/core-web-vitals", "next/typescript", "prettier"],
//   "plugins": ["prettier"],
//   "rules": {
//     "react-hooks/rules-of-hooks": "error",
//     "react-hooks/exhaustive-deps": "warn",
//     "no-unused-vars": "warn",
//     "@typescript-eslint/no-unused-vars": "warn",
//     "prefer-const": "error",
//     "no-var": "error",
//     "@typescript-eslint/ban-ts-comment": "off",
//     "@typescript-eslint/no-explicit-any": "warn",
//     "prettier/prettier": "error"
//   }
// }

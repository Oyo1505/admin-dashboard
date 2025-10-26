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
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
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

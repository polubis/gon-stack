import jsxA11y from 'eslint-plugin-jsx-a11y';
import { plugin } from './plugin.js';

const APP_SRC = ['src/**/*.{ts,tsx}'];
const NOT_TESTS = ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__e2e__/**'];

const layer = (files, patterns, message) => ({
  files,
  ignores: NOT_TESTS,
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: patterns.map((group) => ({ group, message })) },
    ],
  },
});

/**
 * Source conventions for app code. Globs are relative to the app directory
 * (ESLint runs per app), so use this from an app's `eslint.config.js`.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  {
    files: APP_SRC,
    plugins: { repo: plugin },
    rules: {
      'repo/no-barrel': 'error',
      'repo/no-raw-tailwind': 'error',
    },
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['src/**/*.tsx'],
  },
  layer(
    ['src/modules/*/domain/**/*.{ts,tsx}'],
    [
      ['react', 'react-dom', 'react-dom/*'],
      ['**/presentation/**', '**/integration/**', '**/core/**'],
    ],
    'domain is pure types and logic: no UI, transport, persistence or state.',
  ),
  layer(
    ['src/modules/*/core/**/*.{ts,tsx}'],
    [['**/presentation/**']],
    'core is UI-agnostic: it must not import presentation.',
  ),
];

import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  // Ignore generated/third-party type files (regenerated frequently).
  {
    ignores: [
      '.astro/**',
      '.wrangler/**',
      'worker-configuration.d.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  // e2e specs must reach elements through the type-safe `getByE2e` /
  // `getByE2ePrefix` fixtures (see src/__e2e__/__log__/0002-*.md).
  {
    files: ['src/**/__e2e__/**/*.ts'],
    ignores: ['src/__e2e__/test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='getByTestId']",
          message: 'Use getByE2e / getByE2ePrefix from the e2e context.',
        },
      ],
    },
  },
];

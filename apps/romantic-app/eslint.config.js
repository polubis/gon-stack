import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  // Ignore generated/third-party type files (regenerated frequently).
  {
    ignores: ['.astro/**', 'worker-configuration.d.ts'],
  },
];

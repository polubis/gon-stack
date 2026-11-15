import { config } from '@repo/eslint-config/react-internal';
import { config as conventions } from '@repo/eslint-config/conventions';
import { config as testing } from '@repo/eslint-config/testing';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  { ignores: ['.astro/**', 'dist/**'] },
  ...testing,
  ...conventions,
];

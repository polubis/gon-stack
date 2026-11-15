import { plugin } from './plugin.js';

/**
 * Server code that talks to Supabase. Globs are relative to the app directory.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  {
    files: ['src/server/**/*.ts'],
    // The mapper itself builds InternalServer from raw codes: it is the one place allowed to.
    ignores: ['**/__tests__/**', '**/adapter/supabase.ts'],
    plugins: { repo: plugin },
    rules: { 'repo/no-raw-internal-server': 'error' },
  },
];

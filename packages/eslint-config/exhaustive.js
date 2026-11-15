import tseslint from 'typescript-eslint';

/**
 * Type-aware rules (slower: need the TypeScript program).
 *
 * @param {string} tsconfigRootDir app directory holding `tsconfig.json`
 * @returns {import("eslint").Linter.Config[]}
 */
export const exhaustive = (tsconfigRootDir) => [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__e2e__/**'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true, tsconfigRootDir },
    },
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          considerDefaultExhaustiveForUnions: false,
          requireDefaultForNonUnion: false,
        },
      ],
    },
  },
];

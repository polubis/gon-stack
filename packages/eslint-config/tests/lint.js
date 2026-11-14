import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { config as conventions } from '../conventions.js';
import { config as supabase } from '../supabase.js';
import { config as testing } from '../testing.js';
import { exhaustive } from '../exhaustive.js';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const parser = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: { parser: tseslint.parser },
};

/** Lint `code` as if it lived at `filePath`, with every repo preset on. */
export const lint = async (filePath, code) => {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: [parser, ...testing, ...conventions, ...supabase],
  });
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map(({ ruleId, message }) => ({ ruleId, message }));
};

export const lintFixture = async (name) => {
  const root = fileURLToPath(
    new URL('./fixtures/exhaustive/', import.meta.url),
  );
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: exhaustive(root),
  });
  const [result] = await eslint.lintFiles([`src/${name}.ts`]);
  return result.messages.map(({ ruleId, message }) => ({ ruleId, message }));
};

import { fileURLToPath } from 'node:url';
import type { RuleUnit } from '../config.js';

const RAW_WRAP = /\bnew InternalServer\(\s*[\w.]*[eE]rror\s*\)/g;
const FIX = `Map the error through the adapter. Example:
import { fromSupabaseError } from '../../adapter/supabase';
const { data, error } = await db.from('expenses').select('*');
if (error) throw fromSupabaseError(error);`;

const lineOf = (text: string, index: number): number =>
  text.slice(0, index).split('\n').length;

export const supabaseErrorMapping: RuleUnit = {
  importance: 'A',
  include: ['apps/*/src/server/**/*.ts'],
  exclude: [
    '**/__tests__/**',
    '**/__e2e__/**',
    '**/application/adapter/**',
    '**/application/core/**',
  ],
  fix: FIX,
  doc: {
    file: fileURLToPath(new URL('supabase-error-mapping.md', import.meta.url)),
  },
  run: async ({ files, readText, report }) => {
    for (const file of files) {
      const text = await readText(file);
      for (const match of text.matchAll(RAW_WRAP))
        report(
          `${file}:${lineOf(text, match.index)}: raw InternalServer(error) hides the error class, use fromSupabaseError(error)`,
        );
    }
  },
};

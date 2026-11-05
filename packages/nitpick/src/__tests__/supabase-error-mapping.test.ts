import { describe, expect, it } from 'vitest';
import { supabaseErrorMapping } from '../rules/supabase-error-mapping.js';

const problemsIn = async (source: string) => {
  const reports: string[] = [];
  await supabaseErrorMapping.run?.({
    files: ['apps/x/src/server/a.ts'],
    readText: async () => source,
    git: {
      commitMessages: [],
      stagedAddedFiles: [],
      stagedFiles: [],
      lastCommitMessages: async () => [],
    },
    report: (problem) => reports.push(problem),
    meta: { ruleId: 'supabase-error-mapping', projectRoot: '' },
  });
  return reports;
};

describe('Supabase error rule rejects', () => {
  it.each([
    'throw new InternalServer(error);',
    'throw new InternalServer(itemsError);',
    'throw new InternalServer(expenses.error);',
    'throw new InternalServer( removed.error );',
  ])('%s', async (source) => {
    expect(await problemsIn(`ok\n${source}`)).toEqual([
      'apps/x/src/server/a.ts:2: raw InternalServer(error) hides the error class, use fromSupabaseError(error)',
    ]);
  });
});

describe('Supabase error rule accepts', () => {
  it.each([
    'throw fromSupabaseError(error);',
    "throw new InternalServer(error, 'Receipt analysis failed');",
    "throw new InternalServer(new Error('Unsupported image type'));",
    'throw new Conflict(error, "x");',
  ])('%s', async (source) => {
    expect(await problemsIn(source)).toEqual([]);
  });
});

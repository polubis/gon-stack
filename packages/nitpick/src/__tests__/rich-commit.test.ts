import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { richCommit } from '../rules/rich-commit.js';

const run = async (rule: typeof richCommit, message: string) => {
  const reports: string[] = [];
  await rule.check?.({
    files: [],
    readText: async () => '',
    git: { commitMessages: [message], lastCommitMessages: async () => [] },
    report: (problem) => reports.push(problem),
    meta: { ruleId: rule.id, projectRoot: '' },
  });
  return reports;
};
const commitProblems = (message: string) => run(richCommit, message);

const valid = `fix(repo): prevent racing of requests

- Introduce a request id
  - Nested list
- Other points`;

describe('Rule works when', () => {
  it('can be overridden by spread', async () => {
    expect(await commitProblems('oops')).not.toEqual([]);
    expect(
      await run({ ...richCommit, check: () => {}, fix: 'x' }, 'oops'),
    ).toEqual([]);
  });
});

describe('Commit validation works when', () => {
  it('accepts a conventional commit with a nested change list', async () => {
    expect(await commitProblems(valid)).toEqual([]);
  });

  it('accepts a breaking change marker', async () => {
    expect(
      await commitProblems(valid.replace('fix(repo):', 'fix(repo)!:')),
    ).toEqual([]);
  });

  it('rejects subject without scope', async () => {
    expect(
      await commitProblems(valid.replace('fix(repo)', 'fix')),
    ).toHaveLength(1);
  });

  it('rejects unknown type', async () => {
    expect(await commitProblems(valid.replace('fix', 'oops'))).toHaveLength(1);
  });

  it('rejects subject-only commit', async () => {
    expect(await commitProblems('fix(repo): prevent racing')).toHaveLength(1);
  });

  it('rejects missing blank line after subject', async () => {
    expect(
      await commitProblems(valid.replace('requests\n\n', 'requests\n')),
    ).toHaveLength(1);
  });

  it.each([
    'Refs: #123',
    'Reviewed-by: Z',
    'Co-authored-by: A <a@b.c>',
    'Generated with Claude Code',
    '- Co-Authored-By: A',
    '- Fixes #1',
    '🤖 note',
  ])('rejects footer %s', async (footer) => {
    expect(await commitProblems(`${valid}\n${footer}`)).toEqual([
      `Footer, trailer, reference or credit not allowed, found "${footer}"`,
    ]);
  });

  it('rejects a footer separated by a blank line', async () => {
    expect(await commitProblems(`${valid}\n\nRefs: #1`)).toEqual([
      'Blank line not allowed inside the change list',
      'Footer, trailer, reference or credit not allowed, found "Refs: #1"',
    ]);
  });

  it('rejects prose in body', async () => {
    expect(await commitProblems(`${valid}\nsome prose`)).toHaveLength(1);
  });
});

describe('Rule metadata works when', () => {
  it('describes the commit format in an instruction file', async () => {
    const { instruction } = richCommit;
    if (typeof instruction === 'function') throw new Error('expected file');
    expect(await readFile(instruction.file, 'utf8')).toContain(
      'fix(repo)!: prevent racing of requests',
    );
  });

  it('rejects a commit without blank line and change list', async () => {
    expect(await commitProblems('fix(repo): title\nprose')).toEqual([
      'Blank line required after subject',
      'Body must contain a "- " change list',
    ]);
  });
});

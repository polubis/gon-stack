import { describe, expect, it } from 'vitest';
import { richCommit } from '../rules/rich-commit.js';

const check = async (...messages: string[]) => {
  const reports: string[] = [];
  await richCommit.check?.({
    files: [],
    readText: async () => '',
    git: {
      commitMessages: messages,
      stagedAddedFiles: [],
      lastCommitMessages: async () => [],
    },
    report: (problem) => reports.push(problem),
    meta: { ruleId: richCommit.id, projectRoot: '' },
  });
  return reports;
};

const subject = 'fix(repo): prevent racing';
const body = '\n\n- Change';
const message = (head: string, tail = body) => `${head}${tail}`;

describe('Subject validation works when', () => {
  it.each([
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
  ])('accepts type %s', async (type) => {
    expect(await check(message(`${type}(app): title`))).toEqual([]);
  });

  it.each([
    ['uppercase type', 'Fix(repo): title'],
    ['empty scope', 'fix(): title'],
    ['scope with space', 'fix(my repo): title'],
    ['nested parentheses in scope', 'fix(a(b)): title'],
    ['bang before scope', 'fix!(repo): title'],
    ['missing space after colon', 'fix(repo):title'],
    ['double space after colon', 'fix(repo):  title'],
    ['missing title', 'fix(repo): '],
    ['missing colon', 'fix(repo) title'],
    ['type only', 'fix: title'],
    ['empty subject', ''],
    ['leading space', ' fix(repo): title'],
    ['type prefix of a longer word', 'fixes(repo): title'],
    ['two bangs', 'fix(repo)!!: title'],
  ])('rejects %s', async (_name, head) => {
    const problems = await check(message(head));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toBe(
      `Subject must be "type(scope)!: title", found "${head}"`,
    );
  });

  it('accepts scopes with dashes, slashes, dots and digits', async () => {
    expect(await check(message('feat(app-ui/v2.1): title'))).toEqual([]);
  });

  it('accepts titles with punctuation, unicode and trailing text', async () => {
    expect(
      await check(message('fix(repo)!: handle "quotes", (parens) & zażółć')),
    ).toEqual([]);
  });

  it('accepts a title that itself contains a colon', async () => {
    expect(await check(message('fix(repo): note: tricky'))).toEqual([]);
  });
});

describe('Body validation works when', () => {
  it('requires a body', async () => {
    expect(await check(subject)).toEqual([
      'Body with a "- " change list is required',
    ]);
  });

  it('treats trailing blank lines as no body', async () => {
    expect(await check(`${subject}\n\n\n`)).toEqual([
      'Body with a "- " change list is required',
    ]);
  });

  it('ignores trailing whitespace after the last line', async () => {
    expect(await check(`${subject}${body}\n\n  \n`)).toEqual([]);
  });

  it('accepts a body with only a change list', async () => {
    expect(await check(`${subject}\n\n- One`)).toEqual([]);
  });

  it('accepts several top-level items and deep nesting', async () => {
    expect(
      await check(`${subject}\n\n- One\n  - Two\n    - Three\n- Four\n`),
    ).toEqual([]);
  });

  it('rejects blank lines between items', async () => {
    expect(await check(`${subject}\n\n- One\n\n- Two`)).toEqual([
      'Blank line not allowed inside the change list',
    ]);
  });

  it('rejects trailers with dashes in the key', async () => {
    expect(await check(`${subject}${body}\nCo-authored-by: A <a@b.c>`)).toEqual(
      [
        'Footer, trailer, reference or credit not allowed, found "Co-authored-by: A <a@b.c>"',
      ],
    );
  });

  it('rejects a footer after a blank line and reports both problems', async () => {
    expect(await check(`${subject}${body}\n\nRefs: #1`)).toEqual([
      'Blank line not allowed inside the change list',
      'Footer, trailer, reference or credit not allowed, found "Refs: #1"',
    ]);
  });

  it('rejects a body without any change list item', async () => {
    expect(await check(`${subject}\n\nRefs: #1`)).toEqual([
      'Body must contain a "- " change list',
      'Footer, trailer, reference or credit not allowed, found "Refs: #1"',
    ]);
  });

  it('rejects a change list that only has indented items', async () => {
    expect(await check(`${subject}\n\n  - nested only`)).toEqual([
      'Body must contain a "- " change list',
    ]);
  });

  it.each([
    ['bullet without space', '-Item'],
    ['star bullet', '* Item'],
    ['bare dash', '-'],
    ['numbered list', '1. Item'],
    ['custom trailer', 'Key: value'],
    ['trailer key starting with a digit', '1Refs: x'],
    ['indented trailer', '  Key: value'],
    ['plain prose', 'some prose'],
  ])('rejects %s', async (_name, line) => {
    const problems = await check(`${subject}${body}\n${line}`);
    expect(problems).toEqual([
      `Only "- " list items are allowed after the subject, found "${line}"`,
    ]);
  });

  it('rejects a missing blank line and keeps checking the rest as body', async () => {
    expect(await check(`${subject}\n- Change\nprose`)).toEqual([
      'Blank line required after subject',
      'Body must contain a "- " change list',
      'Only "- " list items are allowed after the subject, found "prose"',
    ]);
  });

  it('reports every bad body line separately', async () => {
    const problems = await check(`${subject}${body}\nfirst\nsecond`);
    expect(problems).toHaveLength(2);
  });

  it('reports subject and body problems together', async () => {
    expect(await check('oops\n\nprose')).toEqual([
      'Subject must be "type(scope)!: title", found "oops"',
      'Body must contain a "- " change list',
      'Only "- " list items are allowed after the subject, found "prose"',
    ]);
  });
});

describe('Message handling works when', () => {
  it('accepts Windows line endings', async () => {
    expect(await check('fix(repo): title\r\n\r\n- One\r\n  - Two\r\n')).toEqual(
      [],
    );
  });

  it('rejects a message with a leading blank line', async () => {
    const problems = await check(`\n${subject}${body}`);
    expect(problems[0]).toContain('Subject must be');
  });

  it('accepts a message ending with several newlines', async () => {
    expect(await check(`${subject}${body}\n\n\n\n`)).toEqual([]);
  });

  it('checks every commit message and reports all problems', async () => {
    expect(await check(`${subject}${body}`, 'bad', 'worse')).toHaveLength(4);
  });

  it('reports nothing when there are no messages', async () => {
    expect(await check()).toEqual([]);
  });
});

describe('Rule definition works when', () => {
  it('has a stable id, group and importance default', () => {
    expect(richCommit.id).toBe('rich-commit');
    expect(richCommit.group).toBe('git');
    expect(richCommit.importance).toBeUndefined();
  });

  it('points to an absolute instruction file', () => {
    expect(typeof richCommit.instruction).toBe('object');
    if (typeof richCommit.instruction === 'function') return;
    expect(richCommit.instruction.file).toMatch(/rich-commit\.md$/);
    expect(richCommit.instruction.file).toMatch(/^([a-zA-Z]:)?[\\/]/);
  });
});

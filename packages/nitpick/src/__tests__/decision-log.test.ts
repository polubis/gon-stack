import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateDecisionLog } from '../rules/decision-log.js';
import { run } from '../run.js';

const rulePath = join(import.meta.dirname, '..', 'rules', 'decision-log.ts')
  .split(String.fromCharCode(92))
  .join('/');

const CONFIG = String.raw`import { decisionLog } from '${rulePath}';
export default {
  rules: [
    decisionLog({
      scopes: [/^(repo|claude|nitpick)$/, /^(parka|uih)(\/[a-z0-9-]+)*$/],
    }),
  ],
};`;

const NAME = 'decisions/0001-parka-add-thing.md';

const doc = (
  fields: Record<string, string | undefined> = {},
  body = '- Add the thing\n',
) => {
  const all = {
    ticket: 'none',
    scope: 'parka/dashboard',
    summary: 'Add the thing to dashboard',
    why: 'The thing was missing for users',
    ...fields,
  };
  const head = Object.entries(all)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) =>
      value?.startsWith('\n') ? `${key}:${value}` : `${key}: ${value}`,
    )
    .join('\n');
  return `---\n${head}\n---\n\n${body}`;
};

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, stdio: 'ignore' });

let errors: string[];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, 'error').mockImplementation((message: string) => {
    errors.push(message);
  });
});
afterEach(() => vi.restoreAllMocks());

const output = () => errors.join('\n');

const commitCheck = async (
  committed: Record<string, string>,
  staged: Record<string, string>,
  moves: [string, string][] = [],
) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-decision-'));
  const write = async (files: Record<string, string>) => {
    for (const [name, text] of Object.entries(files)) {
      await mkdir(dirname(join(root, name)), { recursive: true });
      await writeFile(join(root, name), text);
    }
  };
  await mkdir(join(root, '.nitpick'));
  await writeFile(join(root, '.nitpick', 'config.ts'), CONFIG);
  await writeFile(join(root, 'msg.txt'), 'feat(x): y\n\n- z\n');
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 't@t.t');
  git(root, 'config', 'user.name', 't');
  git(root, 'config', 'commit.gpgsign', 'false');
  await write(committed);
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '--allow-empty', '-m', 'init');
  await run(['--sync'], root);
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'sync');
  for (const [from, to] of moves) {
    await mkdir(dirname(join(root, to)), { recursive: true });
    git(root, 'mv', from, to);
  }
  await write(staged);
  git(root, 'add', '-A');
  return run(['--check', '--commit-msg', 'msg.txt'], root);
};

const OPTIONS = {
  scopes: [/^(repo|claude|nitpick)$/, /^(parka|uih)(\/[a-z0-9-]+)*$/],
};

const problemsOf = (content: string, name = NAME, existing: number[] = []) =>
  validateDecisionLog(name, content, existing, OPTIONS).join('\n');

const failsWith = (
  content: string,
  expected: string,
  name = NAME,
  existing: number[] = [],
) => expect(problemsOf(content, name, existing)).toContain(expected);

describe('Decision entry rule accepts', () => {
  it('a commit that adds a valid entry', async () => {
    expect(await commitCheck({}, { 'a.ts': 'x', [NAME]: doc() })).toBe(0);
  });

  it('an entry with all optional keys', () => {
    const full = doc(
      {
        ticket: 'ABC-123',
        date: '2026-10-11',
        supersedes: '0001',
        tags: '[ux, "dash-board"]',
        models: '\n  - claude-opus\n  - claude-sonnet',
        inputTokens: '1200',
        outTokens: '300',
        cost: '0.42',
        workTimeInMinutes: '15.5',
        why: '"Total: budget answer first # important"',
      },
      '- Order: hero, limits\n  - Nested detail\n    - Deeper detail\n- Second\n',
    );
    expect(
      validateDecisionLog(
        'decisions/0002-parka-order-tiles.md',
        full,
        [1],
        OPTIONS,
      ),
    ).toEqual([]);
  });

  it('CRLF entries', () => {
    expect(problemsOf(doc().replaceAll('\n', '\r\n'))).toBe('');
  });

  it('a pure rename next to one new entry', async () => {
    expect(
      await commitCheck(
        { 'old/note.md': doc() },
        { 'decisions/0002-parka-add-other.md': doc() },
        [['old/note.md', NAME]],
      ),
    ).toBe(0);
  });
});

describe('Decision entry rule accepts a commit that only', () => {
  it('edits existing decisions', async () => {
    expect(
      await commitCheck({ [NAME]: doc() }, { [NAME]: doc() + '- More\n' }),
    ).toBe(0);
  });

  it('moves files into decisions', async () => {
    expect(
      await commitCheck({ 'old/note.md': doc() }, {}, [['old/note.md', NAME]]),
    ).toBe(0);
  });
});

describe('Decision entry rule rejects', () => {
  it('an edited decision next to other changes', async () => {
    expect(
      await commitCheck(
        { [NAME]: doc() },
        { [NAME]: doc() + '- More\n', 'a.ts': 'x' },
      ),
    ).toBe(1);
    expect(output()).toContain('No new "decisions/');
  });

  it('a commit without any entry', async () => {
    expect(await commitCheck({}, { 'a.ts': 'x' })).toBe(1);
    expect(output()).toContain('[decision-log] No new "decisions/');
    expect(output()).toContain('Fix: Add exactly one new file');
  });

  it('a commit that adds more than one entry', async () => {
    expect(
      await commitCheck(
        {},
        {
          [NAME]: doc(),
          'decisions/0002-parka-add-other.md': doc(),
        },
      ),
    ).toBe(1);
    expect(output()).toContain('Exactly one new "decisions/');
  });

  it('an entry that is created but not staged', async () => {
    const root = await mkdtemp(join(tmpdir(), 'nitpick-decision-'));
    await mkdir(join(root, '.nitpick'));
    await mkdir(join(root, 'decisions'));
    await writeFile(join(root, '.nitpick', 'config.ts'), CONFIG);
    await writeFile(join(root, 'msg.txt'), 'feat(x): y\n\n- z\n');
    await writeFile(join(root, NAME), doc());
    git(root, 'init', '-q');
    await run(['--sync'], root);
    errors.length = 0;
    expect(await run(['--check', '--commit-msg', 'msg.txt'], root)).toBe(1);
    expect(output()).toContain('No new "decisions/');
  });

  it('a new entry in a __log__ directory', async () => {
    expect(
      await commitCheck(
        {},
        { 'apps/a/__log__/0001-add-thing.md': doc(), 'a.ts': 'x' },
      ),
    ).toBe(1);
    expect(output()).toContain('decisions live in "decisions/"');
    expect(output()).toContain('No new "decisions/');
  });

  it('a misnamed file', () => {
    failsWith(doc(), 'name must be "decisions/NNNN-', 'decisions/notes.md');
  });

  it('a number that is not the next free one', () => {
    failsWith(
      doc(),
      'next free one: 0001, found 0003',
      'decisions/0003-parka-add-thing.md',
    );
    failsWith(doc(), 'next free one: 0002, found 0001', NAME, [1]);
  });

  it('a slug that is too short or too long', () => {
    failsWith(
      doc({ scope: 'uih' }),
      'slug "uih-add" must have 8-60',
      'decisions/0001-uih-add.md',
    );
    failsWith(
      doc(),
      'must have 8-60 characters',
      `decisions/0001-parka-add-${'long-'.repeat(12)}name.md`,
    );
  });

  it('a slug that ignores scope prefix, verb or object', () => {
    failsWith(
      doc(),
      'must start with the scope prefix "parka-"',
      'decisions/0001-dashboard-add-thing.md',
    );
    failsWith(
      doc(),
      'put an imperative verb',
      'decisions/0001-parka-thing-added.md',
    );
    failsWith(
      doc(),
      'add an object after the verb "add"',
      'decisions/0001-parka-add.md',
    );
  });

  it('a file without frontmatter', () => {
    failsWith('- Add\n', 'must start with a "---" YAML frontmatter');
    failsWith('---\nticket: none\n', 'closed by "---"');
  });

  it('unknown, duplicate and missing keys', () => {
    failsWith(doc({ status: 'done' }), 'unknown key "status"');
    failsWith(
      doc({ why: undefined, ticket: undefined }),
      'missing required key "why"',
    );
    failsWith(doc({ cost: '1\ncost: 2' }), 'duplicate key "cost"');
  });

  it('lists and scalars in the wrong place', () => {
    failsWith(doc({ tags: 'ux' }), '"tags" must be a list');
    failsWith(doc({ ticket: '[a]' }), '"ticket" must be a single value');
    failsWith(doc({ summary: '[a]' }), '"summary" must be a single value');
    failsWith(doc({ tags: '[]' }), '"tags" must not be empty');
  });

  it('unsupported YAML', () => {
    failsWith(doc({ why: 'Total: budget' }), 'unsupported YAML value');
    failsWith(doc({ why: 'Total # budget' }), 'unsupported YAML value');
    failsWith(doc({ why: '{a: b}' }), 'unsupported YAML value');
    failsWith(doc({ why: '"open' }), 'unsupported YAML value');
    failsWith(
      doc({ tags: '\n  - ok\n  - bad: item' }),
      'unsupported YAML value "bad: item"',
    );
    failsWith(doc({ tags: '[a, ]' }), 'unsupported YAML value');
    failsWith(doc({ tags: '[a' }), 'unsupported YAML value');
    failsWith(
      doc({ summary: 'Add the thing to dashboard\n- stray' }),
      'unsupported line "- stray"',
    );
    failsWith(
      doc({ summary: 'Add the thing to dashboard\n  indented: no' }),
      'unsupported line "  indented: no"',
    );
  });

  it('a ticket that is not none or an id', () => {
    failsWith(doc({ ticket: 'fix it' }), '"ticket" must be "none" or an id');
  });

  it('a scope with bad syntax or not on the allowed list', () => {
    failsWith(doc({ scope: undefined }), 'missing required key "scope"');
    failsWith(doc({ scope: 'Parka' }), 'lowercase kebab segments');
    failsWith(doc({ scope: 'parka//x' }), 'lowercase kebab segments');
    failsWith(doc({ scope: 'other' }), '"other" is not allowed');
  });

  it('a summary or why outside the length bounds', () => {
    failsWith(doc({ summary: 'Short' }), '"summary" must have 10-70');
    failsWith(doc({ summary: 'x'.repeat(71) }), '"summary" must have 10-70');
    failsWith(doc({ why: 'Short' }), '"why" must have 10-200');
    failsWith(doc({ why: 'x'.repeat(201) }), '"why" must have 10-200');
  });

  it('a date that is not real', () => {
    failsWith(doc({ date: '11-10-2026' }), '"date" must be a real date');
    failsWith(doc({ date: '2026-02-30' }), '"date" must be a real date');
  });

  it('a supersedes that is malformed or missing', () => {
    failsWith(doc({ supersedes: '22' }), '4 digit number');
    failsWith(doc({ supersedes: '0009' }), '0009 does not exist');
  });

  it('tags and metrics with wrong shape', () => {
    failsWith(doc({ tags: '[Bad_Tag]' }), 'tag "Bad_Tag" must be kebab-case');
    failsWith(doc({ inputTokens: '1.5' }), '"inputTokens" must be');
    failsWith(doc({ cost: 'free' }), '"cost" must be');
  });

  it('a body layout that breaks the list format', () => {
    const head = doc({}, '').replace(/\n$/, '');
    failsWith(head, 'body must have 1-40 bullet lines, found 0');
    failsWith(doc().replace('---\n\n', '---\n'), 'one blank line must follow');
    failsWith(doc({}, '- Add'), 'end with a single newline');
    failsWith(doc({}, '# Heading\n'), 'only "- " list items');
    failsWith(doc({}, '- Add\nprose\n'), 'body line 2: only "- "');
    failsWith(doc({}, '- Add\n\n- More\n'), 'body line 2: only "- "');
    failsWith(doc({}, '- \n'), 'body line 1: only "- "');
    failsWith(doc({}, '- Add\n   - odd\n'), 'body line 2: nest with 2 spaces');
    failsWith(doc({}, '- Add\n    - jump\n'), 'at most one level deeper');
    failsWith(doc({}, '  - start deep\n'), 'body line 1: nest with 2');
    failsWith(doc({}, `- ${'x'.repeat(241)}\n`), 'longer than 240 characters');
    failsWith(doc({}, '- Add\n'.repeat(41)), 'found 41');
  });
});

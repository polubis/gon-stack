import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXIT_CONFIG, EXIT_PROBLEMS, EXIT_USAGE, run } from '../run.js';

const richCommitPath = join(
  import.meta.dirname,
  '..',
  'rules',
  'rich-commit.ts',
)
  .split('\\')
  .join('/');

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, stdio: 'ignore' });

const commit = (root: string, message: string) => {
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '--allow-empty', '-m', message);
};

const project = async (
  configSource: string,
  files: Record<string, string> = {},
  init = true,
) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-edge-run-'));
  await mkdir(join(root, '.nitpick'), { recursive: true });
  await writeFile(join(root, '.nitpick', 'config.ts'), configSource);
  for (const [name, text] of Object.entries(files)) {
    await mkdir(dirname(join(root, name)), { recursive: true });
    await writeFile(join(root, name), text);
  }
  if (init) {
    git(root, 'init', '-q');
    git(root, 'config', 'user.email', 't@t.t');
    git(root, 'config', 'user.name', 't');
    git(root, 'config', 'commit.gpgsign', 'false');
  }
  return root;
};

const rule = (body: string, extra = '') =>
  `{ id: 'r', instruction: () => 'do r', ${extra} check: async (c) => { ${body} } }`;

const source = (...rules: string[]) =>
  `export default { rules: [${rules.join(',')}] };`;

let errors: string[];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, 'error').mockImplementation((message: string) => {
    errors.push(message);
  });
});
afterEach(() => vi.restoreAllMocks());

const synced = async (
  configSource: string,
  files?: Record<string, string>,
  init = true,
) => {
  const root = await project(configSource, files, init);
  await run(['--sync'], root);
  errors.length = 0;
  return root;
};

const reportFiles = rule('c.report(c.files.join(","));');

describe('Exit codes work when', () => {
  it('exposes stable values', () => {
    expect([EXIT_PROBLEMS, EXIT_USAGE, EXIT_CONFIG]).toEqual([1, 2, 3]);
  });
});

describe('CLI arguments work when', () => {
  it('rejects positional arguments', async () => {
    const root = await project(source(rule('')));
    expect(await run(['extra'], root)).toBe(EXIT_USAGE);
    expect(errors.at(-1)).toContain('Usage: nitpick');
  });

  it('rejects a flag that needs a value', async () => {
    const root = await project(source(rule('')));
    expect(await run(['--commit-msg'], root)).toBe(EXIT_USAGE);
    expect(await run(['--range'], root)).toBe(EXIT_USAGE);
  });

  it('accepts flags in any order', async () => {
    const root = await synced(source(rule('')));
    commit(root, 'one');
    expect(await run(['--range', 'HEAD..HEAD', '--check'], root)).toBe(0);
  });

  it('does not run anything when usage is wrong', async () => {
    const root = await project(source(rule('c.report("ran");')));
    await run(['--sync', '--check'], root);
    expect(errors).toEqual(['Use either --sync or --check']);
  });
});

describe('CLI config works when', () => {
  it('exits 3 when the config file is missing', async () => {
    const root = await project('');
    await rm(join(root, '.nitpick', 'config.ts'));
    expect(await run(['--check'], root)).toBe(EXIT_CONFIG);
    expect(errors[0]).toMatch(/^Config error: /);
  });

  it('exits 3 when the config has no rules', async () => {
    const root = await project('export default {};');
    expect(await run(['--check'], root)).toBe(EXIT_CONFIG);
    expect(errors[0]).toMatch(/^Config error: /);
  });

  it('exits 3 when the config has no default export', async () => {
    const root = await project('export const other = 1;');
    expect(await run(['--sync'], root)).toBe(EXIT_CONFIG);
  });

  it('exits 3 when the config throws a non-error value', async () => {
    const root = await project('throw "plain text";');
    expect(await run(['--check'], root)).toBe(EXIT_CONFIG);
    expect(errors).toEqual(['Config error: plain text']);
  });

  it('prefixes every config problem and reports all of them', async () => {
    const root = await project(
      `export default { rules: [
        { id: 'a', instruction: () => '' },
        { id: 'a', instruction: { file: './missing.md' } },
      ] };`,
    );
    expect(await run(['--sync'], root)).toBe(EXIT_CONFIG);
    expect(errors).toEqual([
      '[config] Rule "a": missing file ./missing.md',
      '[config] Duplicate rule id "a"',
    ]);
  });

  it('writes nothing when the config is invalid', async () => {
    const root = await project(
      source(`{ id: 'a', instruction: { file: './nope.md' } }`),
    );
    await run(['--sync'], root);
    await expect(readFile(join(root, '.ai', 'AGENTS.md'))).rejects.toThrow();
  });
});

describe('CLI sync works when', () => {
  it('is idempotent', async () => {
    const root = await project(source(rule('')));
    expect(await run(['--sync'], root)).toBe(0);
    const first = await readFile(join(root, '.ai', 'AGENTS.md'), 'utf8');
    expect(await run(['--sync'], root)).toBe(0);
    expect(await readFile(join(root, '.ai', 'AGENTS.md'), 'utf8')).toBe(first);
  });

  it('creates nested output folders', async () => {
    const root = await project(
      `export default { output: [{ path: 'a/b/c', root: 'X.md' }], rules: [] };`,
    );
    expect(await run(['--sync'], root)).toBe(0);
    expect(await readFile(join(root, 'a', 'b', 'c', 'X.md'), 'utf8')).toBe(
      '# Information for AI\n',
    );
  });

  it('works outside a git repository', async () => {
    const root = await project(source(rule('')), {}, false);
    expect(await run(['--sync'], root)).toBe(0);
  });

  it('overwrites a manually edited file', async () => {
    const root = await synced(source(rule('')));
    await writeFile(join(root, '.ai', 'AGENTS.md'), 'edited');
    expect(await run(['--sync'], root)).toBe(0);
    expect(await run(['--check'], root)).toBe(0);
  });

  it('writes all outputs', async () => {
    const root = await project(
      `export default {
        output: [{ path: '.ai', root: 'CLAUDE.md' }, { path: '.ai', root: 'AGENTS.md' }],
        rules: [],
      };`,
    );
    await run(['--sync'], root);
    expect(await readFile(join(root, '.ai', 'AGENTS.md'), 'utf8')).toBe(
      'Follow instructions here: [CLAUDE.md](CLAUDE.md)\n',
    );
  });
});

describe('CLI drift detection works when', () => {
  it('reports an edited generated file and recovers after sync', async () => {
    const root = await synced(source(rule('')));
    await writeFile(join(root, '.ai', 'AGENTS.md'), 'edited');
    expect(await run(['--check'], root)).toBe(EXIT_PROBLEMS);
    expect(errors[0]).toMatch(/AGENTS\.md is out of date, run nitpick --sync/);
    await run(['--sync'], root);
    errors.length = 0;
    expect(await run(['--check'], root)).toBe(0);
  });

  it('reports a deleted generated file', async () => {
    const root = await synced(source(rule('')));
    await rm(join(root, '.ai', 'AGENTS.md'));
    expect(await run(['--check'], root)).toBe(EXIT_PROBLEMS);
  });

  it('reports a stale next output separately', async () => {
    const root = await synced(
      `export default {
        output: [{ path: '.ai', root: 'A.md' }, { path: 'docs', root: 'B.md' }],
        rules: [],
      };`,
    );
    await writeFile(join(root, 'docs', 'B.md'), 'stale');
    await run(['--check'], root);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('B.md');
  });

  it('lists drift before rule problems and keeps exit 1', async () => {
    const root = await project(source(rule('c.report("bad");')));
    expect(await run(['--check'], root)).toBe(EXIT_PROBLEMS);
    expect(errors).toEqual([expect.stringContaining('[sync]'), '[r] bad']);
  });

  it('does not write anything while checking', async () => {
    const root = await project(source(rule('')));
    await run(['--check'], root);
    await expect(readFile(join(root, '.ai', 'AGENTS.md'))).rejects.toThrow();
  });
});

describe('Check execution works when', () => {
  it('runs rules in config order and reports in that order', async () => {
    const root = await synced(
      source(
        `{ id: 'one', instruction: () => '1', check: ({ report }) => report('a') }`,
        `{ id: 'two', instruction: () => '2', check: ({ report }) => report('b') }`,
      ),
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[one] a', '[two] b']);
  });

  it('skips rules without a check', async () => {
    const root = await synced(source(`{ id: 'x', instruction: () => 'x' }`));
    expect(await run(['--check'], root)).toBe(0);
  });

  it('awaits async checks', async () => {
    const root = await synced(
      source(
        rule('await new Promise((r) => setTimeout(r, 20)); c.report("late");'),
      ),
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] late']);
  });

  it('reports several problems from one rule', async () => {
    const root = await synced(source(rule('c.report("a"); c.report("b");')));
    await run(['--check'], root);
    expect(errors).toEqual(['[r] a', '[r] b']);
  });

  it('turns a throwing check into a problem and runs the other rules', async () => {
    const root = await synced(
      source(
        rule('throw new Error("boom");'),
        `{ id: 'next', instruction: () => 'n', check: ({ report }) => report('still ran') }`,
      ),
    );
    expect(await run(['--check'], root)).toBe(EXIT_PROBLEMS);
    expect(errors).toEqual(['[r] check failed: boom', '[next] still ran']);
  });

  it('turns a rejected promise and a thrown string into problems', async () => {
    const root = await synced(
      source(
        rule('return Promise.reject(new Error("nope"));'),
        `{ id: 's', instruction: () => 's', check: () => { throw 'text'; } }`,
      ),
    );
    await run(['--check'], root);
    expect(errors).toEqual([
      '[r] check failed: nope',
      '[s] check failed: text',
    ]);
  });

  it('keeps problems reported before a check throws', async () => {
    const root = await synced(
      source(rule('c.report("before"); throw new Error("after");')),
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] before', '[r] check failed: after']);
  });

  it('rejects readText for a missing file as a failed check', async () => {
    const root = await synced(source(rule('await c.readText("ghost.txt");')));
    await run(['--check'], root);
    expect(errors[0]).toMatch(/^\[r\] check failed: /);
  });

  it('gives each rule its own id and the project root in meta', async () => {
    const root = await synced(
      source(
        `{ id: 'x', instruction: () => '', check: ({ report, meta }) => report(meta.ruleId + '@' + meta.projectRoot) }`,
      ),
    );
    await run(['--check'], root);
    expect(errors).toEqual([`[x] x@${root}`]);
  });
});

describe('Files snapshot works when', () => {
  it('skips gitignored files and keeps untracked ones', async () => {
    const root = await synced(source(reportFiles), {
      '.gitignore': 'ignored.txt\nbuild/\n',
      'ignored.txt': '',
      'build/out.js': '',
      'kept.txt': '',
    });
    await run(['--check'], root);
    expect(errors).toHaveLength(1);
    expect(errors[0]).not.toContain('ignored.txt');
    expect(errors[0]).not.toContain('build/');
    expect(errors[0]).toContain('kept.txt');
    expect(errors[0]).toContain('.gitignore');
  });

  it('skips tracked files that were deleted from disk', async () => {
    const root = await synced(source(reportFiles), {
      'gone.txt': 'x',
      'stay.txt': 'y',
    });
    commit(root, 'chore(app): add');
    await rm(join(root, 'gone.txt'));
    await run(['--check'], root);
    expect(errors[0]).not.toContain('gone.txt');
    expect(errors[0]).toContain('stay.txt');
  });

  it('lists files with spaces and non-ascii names literally', async () => {
    const root = await synced(source(reportFiles), {
      'with space.txt': '',
      'zażółć.txt': '',
      'dir/ünï.txt': '',
    });
    await run(['--check'], root);
    expect(errors[0]).toContain('with space.txt');
    expect(errors[0]).toContain('zażółć.txt');
    expect(errors[0]).toContain('dir/ünï.txt');
  });

  it('reads non-ascii file names through readText', async () => {
    const root = await synced(
      source(rule('c.report(await c.readText("zażółć.txt"));')),
      { 'zażółć.txt': 'treść' },
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] treść']);
  });

  it('lists a file once when it is tracked and modified', async () => {
    const root = await synced(
      source(
        rule('c.report(String(c.files.filter((f) => f === "a.txt").length));'),
      ),
      { 'a.txt': '1' },
    );
    commit(root, 'chore(app): add');
    await writeFile(join(root, 'a.txt'), '2');
    await run(['--check'], root);
    expect(errors).toEqual(['[r] 1']);
  });

  it('gives no files for an empty include list', async () => {
    const root = await synced(
      source(rule('c.report(String(c.files.length));', 'include: [],')),
      { 'a.txt': '' },
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] 0']);
  });

  it('applies exclude alone to all files', async () => {
    const root = await synced(
      source(
        rule('c.report(c.files.join(","));', 'exclude: ["**/*.md", "*.md"],'),
      ),
      { 'a.txt': '', 'b.md': '', 'dir/c.md': '' },
    );
    await run(['--check'], root);
    expect(errors[0]).toContain('a.txt');
    expect(errors).toEqual(['[r] .ai/AGENTS.md,.nitpick/config.ts,a.txt']);
  });

  it('lets exclude win over include and supports several include globs', async () => {
    const root = await synced(
      source(
        rule(
          'c.report(c.files.join(","));',
          'include: ["src/**/*.ts", "docs/*.md"], exclude: ["src/skip/**"],',
        ),
      ),
      {
        'src/a.ts': '',
        'src/skip/b.ts': '',
        'docs/c.md': '',
        'docs/deep/d.md': '',
        'other.ts': '',
      },
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] docs/c.md,src/a.ts']);
  });

  it('does not match dot folders with ** but does with an explicit dot path', async () => {
    const root = await synced(
      source(
        rule('c.report(c.files.join(","));', 'include: ["**/*.md"],'),
        `{ id: 'dot', instruction: () => '', include: ['.ai/**'], check: ({ files, report }) => report(files.join()) }`,
      ),
      { 'docs/a.md': '' },
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] docs/a.md', '[dot] .ai/AGENTS.md']);
  });

  it('gives different rules different file lists', async () => {
    const root = await synced(
      source(
        `{ id: 'ts', instruction: () => '', include: ['**/*.ts'], check: ({ files, report }) => report(files.join()) }`,
        `{ id: 'md', instruction: () => '', include: ['docs/*.md'], check: ({ files, report }) => report(files.join()) }`,
      ),
      { 'a.ts': '', 'docs/b.md': '' },
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[ts] a.ts', '[md] docs/b.md']);
  });

  it('returns the same text for repeated reads', async () => {
    const root = await synced(
      source(
        rule(
          'const a = c.readText("a.txt"); c.report(String(a === c.readText("a.txt")));',
        ),
      ),
      { 'a.txt': 'x' },
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] true']);
  });

  it('reads files from the working tree rather than the index', async () => {
    const root = await synced(
      source(rule('c.report(await c.readText("a.txt"));')),
      { 'a.txt': 'old' },
    );
    commit(root, 'chore(app): add');
    await writeFile(join(root, 'a.txt'), 'new');
    await run(['--check'], root);
    expect(errors).toEqual(['[r] new']);
  });
});

describe('Commit messages work when', () => {
  const messages = rule(
    'c.git.commitMessages.forEach((m) => c.report(JSON.stringify(m)));',
  );

  it('keeps a multi-line message of the last commit', async () => {
    const root = await synced(source(messages));
    commit(root, 'feat(app): add\n\n- one\n- two');
    await run(['--check'], root);
    expect(errors).toEqual([
      `[r] ${JSON.stringify('feat(app): add\n\n- one\n- two\n')}`,
    ]);
  });

  it('exits 2 when the commit message file is missing', async () => {
    const root = await synced(source(messages));
    expect(await run(['--check', '--commit-msg', 'nope.txt'], root)).toBe(
      EXIT_USAGE,
    );
    expect(errors[0]).toMatch(/^Cannot read input: /);
  });

  it('reads a commit message file from an absolute path', async () => {
    const root = await synced(source(messages));
    const other = await mkdtemp(join(tmpdir(), 'nitpick-msg-'));
    await writeFile(join(other, 'm.txt'), 'abs');
    await run(['--check', '--commit-msg', join(other, 'm.txt')], root);
    expect(errors).toEqual([`[r] ${JSON.stringify('abs')}`]);
  });

  it('prefers a commit message file over the range', async () => {
    const root = await synced(source(messages));
    commit(root, 'one');
    await writeFile(join(root, 'm.txt'), 'file');
    await run(
      ['--check', '--commit-msg', 'm.txt', '--range', 'HEAD~1..HEAD'],
      root,
    );
    expect(errors).toEqual([`[r] ${JSON.stringify('file')}`]);
  });

  it('exits 2 for an invalid range instead of passing silently', async () => {
    const root = await synced(source(messages));
    commit(root, 'one');
    expect(await run(['--check', '--range', 'nope..HEAD'], root)).toBe(
      EXIT_USAGE,
    );
    expect(errors[0]).toMatch(/^Cannot read input: /);
  });

  it('treats an empty range as having no messages', async () => {
    const root = await synced(source(messages));
    commit(root, 'one');
    expect(await run(['--check', '--range', 'HEAD..HEAD'], root)).toBe(0);
  });

  it('lists range commits newest first', async () => {
    const root = await synced(source(messages));
    commit(root, 'one');
    commit(root, 'two');
    commit(root, 'three');
    await run(['--check', '--range', 'HEAD~2..HEAD'], root);
    expect(errors).toEqual([
      `[r] ${JSON.stringify('three\n')}`,
      `[r] ${JSON.stringify('two\n')}`,
    ]);
  });

  it('skips empty commit messages', async () => {
    const root = await synced(source(messages));
    git(
      root,
      'commit',
      '-q',
      '--allow-empty',
      '--allow-empty-message',
      '-m',
      '',
    );
    await run(['--check'], root);
    expect(errors).toEqual([]);
  });

  it('exits 2 outside a git repository', async () => {
    const root = await synced(source(rule('')), {}, false);
    expect(await run(['--check'], root)).toBe(EXIT_USAGE);
    expect(errors[0]).toMatch(/^Cannot read input: /);
  });

  it('serves lastCommitMessages for zero, many and more than exist', async () => {
    const root = await synced(
      source(
        rule(
          `c.report(String((await c.git.lastCommitMessages(1)).length) + ":" +
            (await c.git.lastCommitMessages(0)).length + ':' +
            (await c.git.lastCommitMessages(2)).length + ':' +
            (await c.git.lastCommitMessages(50)).length);`,
        ),
      ),
    );
    commit(root, 'one');
    commit(root, 'two');
    commit(root, 'three');
    await run(['--check'], root);
    expect(errors).toEqual(['[r] 1:0:2:3']);
  });

  it('serves lastCommitMessages in an empty repository', async () => {
    const root = await synced(
      source(
        rule('c.report(String((await c.git.lastCommitMessages(3)).length));'),
      ),
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] 0']);
  });
});

describe('Rich commit through the CLI works when', () => {
  const rich = `import { richCommit } from '${richCommitPath}';
    export default { rules: [richCommit] };`;

  it('accepts a real commit and rejects a real bad commit', async () => {
    const root = await synced(rich);
    commit(root, 'feat(app): add thing\n\n- Add the thing');
    expect(await run(['--check'], root)).toBe(0);
    commit(root, 'added a thing');
    expect(await run(['--check'], root)).toBe(EXIT_PROBLEMS);
  });

  it('validates every commit in a range', async () => {
    const root = await synced(rich);
    commit(root, 'feat(app): good\n\n- one');
    commit(root, 'bad one');
    commit(root, 'bad two');
    await run(['--check', '--range', 'HEAD~2..HEAD'], root);
    expect(errors.filter((e) => e.includes('Subject must be'))).toHaveLength(2);
  });

  it('accepts a CRLF commit message file', async () => {
    const root = await synced(rich);
    await writeFile(join(root, 'm.txt'), 'feat(app): add\r\n\r\n- one\r\n');
    expect(await run(['--check', '--commit-msg', 'm.txt'], root)).toBe(0);
  });

  it('writes the rule instruction file and a group heading on sync', async () => {
    const root = await synced(rich);
    expect(await readFile(join(root, '.ai', 'AGENTS.md'), 'utf8')).toBe(
      '# Information for AI\n\n## Rules for Git\n\n### (A) Always\n\n- [rich-commit](rules/rich-commit.md)\n',
    );
    expect(
      await readFile(join(root, '.ai', 'rules', 'rich-commit.md'), 'utf8'),
    ).toContain('One decision/task/work means one commit.');
  });
});

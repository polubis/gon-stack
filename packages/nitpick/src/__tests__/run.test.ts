import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from '../run.js';

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
) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-run-'));
  await mkdir(join(root, '.nitpick'), { recursive: true });
  await writeFile(join(root, '.nitpick', 'config.ts'), configSource);
  for (const [name, text] of Object.entries(files)) {
    await mkdir(dirname(join(root, name)), { recursive: true });
    await writeFile(join(root, name), text);
  }
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 't@t.t');
  git(root, 'config', 'user.name', 't');
  git(root, 'config', 'commit.gpgsign', 'false');
  return root;
};

const withRule = (check = '', extra = '') => `
export default {
  ${extra}
  rules: [{ id: 'r', instruction: () => 'do r', fix: 'fix r', ${check} }],
};`;

let errors: string[];
let guidance: string[];
beforeEach(() => {
  errors = [];
  guidance = [];
  vi.spyOn(console, 'error').mockImplementation((message: string) => {
    (/^(Violated rule|Fix): /.test(message) ? guidance : errors).push(message);
  });
});
afterEach(() => vi.restoreAllMocks());

const synced = async (source: string, files?: Record<string, string>) => {
  const root = await project(source, files);
  await run(['--sync'], root);
  errors.length = 0;
  return root;
};

describe('CLI usage works when', () => {
  it('rejects unknown flags with exit 2', async () => {
    const root = await project(withRule());
    expect(await run(['--bogus'], root)).toBe(2);
    expect(errors.join('\n')).toContain('Usage: nitpick');
  });

  it('rejects --sync together with --check', async () => {
    const root = await project(withRule());
    expect(await run(['--sync', '--check'], root)).toBe(2);
  });
});

describe('CLI config works when', () => {
  it('exits 3 when the config cannot be loaded', async () => {
    const root = await project('throw new Error("boom");');
    expect(await run(['--check'], root)).toBe(3);
    expect(errors[0]).toBe('Config error: boom');
  });

  it('exits 3 when a rule has a check but no fix', async () => {
    const root = await project(
      `export default { rules: [
        { id: 'r', instruction: () => 'do r', check: () => {} },
        { id: 'ok', instruction: () => 'ok' },
      ] };`,
    );
    expect(await run(['--check'], root)).toBe(3);
    expect(errors).toEqual([
      '[config] Rule "r": fix is required when check is defined',
    ]);
  });

  it('exits 3 when knowledge refs are invalid', async () => {
    const root = await project(
      withRule('', "knowledge: { refs: { a: './missing.md' } },"),
    );
    expect(await run(['--check'], root)).toBe(3);
    expect(errors).toEqual([
      '[config] Knowledge "a": missing file ./missing.md',
    ]);
  });
});

describe('CLI sync works when', () => {
  it('writes docs and knowledge, then check passes', async () => {
    const root = await project(
      withRule('', "knowledge: { refs: { a: './a.md' } },"),
      { '.nitpick/a.md': 'knowledge' },
    );
    expect(await run(['--sync'], root)).toBe(0);
    expect(await readFile(join(root, '.ai', 'AGENTS.md'), 'utf8')).toContain(
      '`r`: do r',
    );
    expect(
      await readFile(join(root, '.ai', 'references', 'a.md'), 'utf8'),
    ).toBe('knowledge');
    expect(await run(['--check'], root)).toBe(0);
  });

  it('does not run checks', async () => {
    const root = await project(
      withRule("check: ({ report }) => report('ran'),"),
    );
    expect(await run(['--sync'], root)).toBe(0);
    expect(errors).toEqual([]);
  });
});

describe('CLI check works when', () => {
  it('treats a repository without commits as having no messages', async () => {
    const root = await synced(
      withRule(
        'check: ({ git, report }) => report(String(git.commitMessages.length)),',
      ),
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] 0']);
  });

  it('reports missing docs without writing them', async () => {
    const root = await project(withRule());
    expect(await run(['--check'], root)).toBe(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^\[sync\] .+AGENTS\.md is out of date/);
    await expect(readFile(join(root, '.ai', 'AGENTS.md'))).rejects.toThrow();
  });

  it('defaults to check mode', async () => {
    const root = await project(withRule());
    expect(await run([], root)).toBe(1);
  });

  it('reads a commit message from a file', async () => {
    const root = await synced(
      withRule(
        'check: ({ git, report }) => git.commitMessages.forEach(report),',
      ),
    );
    await writeFile(join(root, 'msg.txt'), 'hello');
    expect(await run(['--check', '--commit-msg', 'msg.txt'], root)).toBe(1);
    expect(errors).toEqual(['[r] hello']);
  });

  it('reads HEAD by default, a range on demand and last n commits', async () => {
    const root = await synced(
      withRule(
        `check: async ({ git, report }) => {
          git.commitMessages.forEach((m) => report(m.trim()));
          (await git.lastCommitMessages(2)).forEach((m) => report('last:' + m.trim()));
        },`,
      ),
    );
    commit(root, 'one');
    commit(root, 'two');
    commit(root, 'three');
    await run(['--check'], root);
    expect(errors).toEqual(['[r] three', '[r] last:three', '[r] last:two']);
    errors.length = 0;
    await run(['--check', '--range', 'HEAD~2..HEAD'], root);
    expect(errors.slice(0, 2)).toEqual(['[r] three', '[r] two']);
  });

  it('filters files by include and exclude and serves text and meta', async () => {
    const root = await synced(
      `export default { rules: [{
        id: 'r',
        include: ['src/**/*.ts'],
        exclude: ['**/*.test.ts'],
        instruction: () => 'x',
        fix: 'f',
        check: async ({ files, readText, report, meta }) => {
          for (const file of files) {
            report(file + '=' + (await readText(file)) + ':' + meta.ruleId);
            await readText(file);
          }
        },
      }] };`,
      {
        'src/b.ts': 'B',
        'src/a.ts': 'A',
        'src/a.test.ts': 'T',
        'docs/c.md': 'C',
      },
    );
    expect(await run(['--check'], root)).toBe(1);
    expect(errors).toEqual(['[r] src/a.ts=A:r', '[r] src/b.ts=B:r']);
  });

  it('gives all files in stable order when include is missing', async () => {
    const root = await synced(
      withRule('check: ({ files, report }) => report(files.join(",")),'),
      { 'z.txt': '', 'a.txt': '' },
    );
    await run(['--check'], root);
    expect(errors).toEqual([
      '[r] .ai/AGENTS.md,.nitpick/config.ts,a.txt,z.txt',
    ]);
  });

  it('runs the real rich-commit rule on good and bad messages', async () => {
    const root = await synced(
      `import { richCommit } from '${richCommitPath}';
       export default { rules: [richCommit] };`,
    );
    await writeFile(join(root, 'bad.txt'), 'oops');
    await writeFile(
      join(root, 'good.txt'),
      'feat(app): add thing\n\n- Add the thing\n',
    );
    expect(await run(['--check', '--commit-msg', 'good.txt'], root)).toBe(0);
    expect(await run(['--check', '--commit-msg', 'bad.txt'], root)).toBe(1);
    expect(errors[0]).toContain('[rich-commit] Subject must be');
  });
});

describe('Violation guidance works when', () => {
  it('points an LLM to the rule file and a fix for a file rule', async () => {
    const root = await synced(
      `import { richCommit } from '${richCommitPath}';
       export default { rules: [richCommit] };`,
    );
    await writeFile(
      join(root, 'bad.txt'),
      'feat(app): add\n\n- one\n\nRefs: #1',
    );
    await run(['--check', '--commit-msg', 'bad.txt'], root);
    expect(guidance).toHaveLength(2);
    expect(guidance[0]).toBe(
      'Violated rule: rich-commit. Read .ai/rules/rich-commit.md',
    );
    expect(guidance[1]).toMatch(/^Fix: Rewrite the commit message as /);
    expect(guidance[1]).toContain('no footer, trailer, reference or credit');
  });

  it('points to the root file for a rule with a function instruction', async () => {
    const root = await synced(withRule("check: (c) => c.report('bad'),"));
    await run(['--check'], root);
    expect(errors).toEqual(['[r] bad']);
    expect(guidance).toEqual([
      'Violated rule: r. Read .ai/AGENTS.md',
      'Fix: fix r',
    ]);
  });

  it('shows the fix of the rule and the configured output path', async () => {
    const root = await synced(
      withRule(
        "fix: 'do it', check: (c) => c.report('bad'),",
        "output: [{ path: 'docs/ai', root: 'RULES.md' }],",
      ),
    );
    await run(['--check'], root);
    expect(guidance).toEqual([
      'Violated rule: r. Read docs/ai/RULES.md',
      'Fix: do it',
    ]);
  });

  it('adds guidance when a check throws', async () => {
    const root = await synced(
      withRule("check: () => { throw new Error('x') },"),
    );
    await run(['--check'], root);
    expect(errors).toEqual(['[r] check failed: x']);
    expect(guidance).toEqual([
      'Violated rule: r. Read .ai/AGENTS.md',
      'Fix: fix r',
    ]);
  });

  it('stays silent for rules without problems', async () => {
    const root = await synced(withRule('check: () => {},'));
    expect(await run(['--check'], root)).toBe(0);
    expect(guidance).toEqual([]);
  });
});

import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from '../run.js';

const logEntryPath = join(import.meta.dirname, '..', 'rules', 'log-entry.ts')
  .split(String.fromCharCode(92))
  .join('/');

const entry = (id = '0001', status = 'done') =>
  `# ${id} - Add thing\n\n\`\`\`json\n{\n  "status": "${status}"\n}\n\`\`\`\n\nChanges.\n\nReason.\n`;

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

const commitCheck = async (
  committed: Record<string, string>,
  staged: Record<string, string>,
) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-log-'));
  const write = async (files: Record<string, string>) => {
    for (const [name, text] of Object.entries(files)) {
      await mkdir(dirname(join(root, name)), { recursive: true });
      await writeFile(join(root, name), text);
    }
  };
  await mkdir(join(root, '.nitpick'));
  await writeFile(
    join(root, '.nitpick', 'config.ts'),
    `import { logEntry } from '${logEntryPath}';\nexport default { rules: [logEntry] };`,
  );
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
  await write(staged);
  git(root, 'add', '-A');
  return run(['--check', '--commit-msg', 'msg.txt'], root);
};

describe('Log entry rule works when', () => {
  it('accepts a commit that adds a valid log entry', async () => {
    expect(
      await commitCheck(
        {},
        { 'a.ts': 'x', '__log__/0001-add-thing.md': entry() },
      ),
    ).toBe(0);
  });

  it('accepts an entry in a nested __log__ directory', async () => {
    expect(
      await commitCheck(
        {},
        { 'apps/a/__log__/0007-add-thing.md': entry('0007', 'failed') },
      ),
    ).toBe(0);
  });

  it('rejects a commit without any log entry', async () => {
    expect(await commitCheck({}, { 'a.ts': 'x' })).toBe(1);
    expect(errors.join('\n')).toContain('[log-entry] No new "__log__/');
    expect(errors.join('\n')).toContain('Fix: Add a new file');
  });

  it('rejects an entry that is only modified, not added', async () => {
    expect(
      await commitCheck(
        { '__log__/0001-add-thing.md': entry() },
        { '__log__/0001-add-thing.md': entry() + 'more\n' },
      ),
    ).toBe(1);
  });

  it('rejects an entry that is created but not staged', async () => {
    const root = await mkdtemp(join(tmpdir(), 'nitpick-log-'));
    await mkdir(join(root, '.nitpick'));
    await mkdir(join(root, '__log__'));
    await writeFile(
      join(root, '.nitpick', 'config.ts'),
      `import { logEntry } from '${logEntryPath}';\nexport default { rules: [logEntry] };`,
    );
    await writeFile(join(root, 'msg.txt'), 'feat(x): y\n\n- z\n');
    await writeFile(join(root, '__log__', '0001-add-thing.md'), entry());
    git(root, 'init', '-q');
    await run(['--sync'], root);
    errors.length = 0;
    expect(await run(['--check', '--commit-msg', 'msg.txt'], root)).toBe(1);
    expect(errors.join('\n')).toContain('No new "__log__/');
  });

  it('rejects a misnamed file in __log__', async () => {
    expect(await commitCheck({}, { '__log__/notes.md': entry() })).toBe(1);
  });

  it('rejects a heading that does not match the file number', async () => {
    expect(
      await commitCheck({}, { '__log__/0002-add-thing.md': entry('0001') }),
    ).toBe(1);
    expect(errors.join('\n')).toContain('first line must be "# 0002 - ');
  });

  it('rejects a missing or unknown status', async () => {
    expect(
      await commitCheck(
        {},
        { '__log__/0001-add-thing.md': entry('0001', 'ok') },
      ),
    ).toBe(1);
    expect(errors.join('\n')).toContain('"status"');
  });

  it('accepts CRLF entries', async () => {
    expect(
      await commitCheck(
        {},
        { '__log__/0001-add-thing.md': entry().replaceAll('\n', '\r\n') },
      ),
    ).toBe(0);
  });
});

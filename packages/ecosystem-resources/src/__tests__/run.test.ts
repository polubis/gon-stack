import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { run } from '../run.ts';

const SRC = dirname(dirname(fileURLToPath(import.meta.url)));
const REPO = join(SRC, '../../..');

const capture = () => {
  const lines: string[] = [];
  return { lines, log: (line: string) => lines.push(line) };
};

describe('ecosystem cli', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'eco-run-'));
    await mkdir(join(root, '.ecosystem'), { recursive: true });
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  const writeConfig = (body: string) =>
    writeFile(
      join(root, '.ecosystem/config.ts'),
      `import { config } from '${pathToFileURL(join(SRC, 'config.ts')).href}';\nexport default config(${body});`,
    );

  it('prints usage and exits 2 without a mode, with two modes or with a stray dry run', async () => {
    for (const args of [
      [],
      ['--reset', '--sync'],
      ['--check', '--dry-run'],
      ['--nope'],
    ]) {
      const { lines, log } = capture();
      expect(await run(args, { root, log })).toBe(2);
      expect(lines.join('\n')).toContain('Usage: ecosystem');
    }
  });

  it('exits 3 when the config is missing or invalid', async () => {
    const missing = capture();
    expect(await run(['--check'], { root, log: missing.log })).toBe(3);
    expect(missing.lines[0]).toContain('Config error');

    await writeConfig(
      `{ clean: { paths: ['/etc'] }, databases: [], ports: [] }`,
    );
    const invalid = capture();
    expect(await run(['--check'], { root, log: invalid.log })).toBe(3);
    expect(invalid.lines[0]).toContain('clean path "/etc"');
  });

  it('resets a repo with --reset and succeeds', async () => {
    await mkdir(join(root, '.evidences'), { recursive: true });
    await writeConfig(
      `{ clean: { paths: ['.evidences'] }, databases: [], ports: [] }`,
    );
    const { lines, log } = capture();

    expect(await run(['--reset'], { root, log })).toBe(0);
    expect(lines.at(-1)).toBe('reset: clean');
  });

  it('supports --reset --dry-run', async () => {
    await writeConfig(
      `{ clean: { paths: ['.evidences'] }, databases: [], ports: [] }`,
    );
    expect(await run(['--reset', '--dry-run'], { root, log: () => {} })).toBe(
      0,
    );
  });

  it('reports a sync error instead of crashing when a generated file is missing', async () => {
    await writeConfig(
      `{ clean: { paths: [] }, ports: [1,2,3,4,5,6,7,8,10,11], databases: [{ app: 'a', dir: 'apps/a', dev: 10, e2e: 11, authPaths: [], ports: { api: 1, db: 2, shadow: 3, pooler: 4, studio: 5, mail: 6, analytics: 7, inspector: 8 }, env: { file: 'apps/a/.env.example', apiUrlKey: 'K' } }] }`,
    );
    const { lines, log } = capture();
    expect(await run(['--check'], { root, log })).toBe(1);
    expect(lines[0]).toContain('Sync error');
  });
});

describe('the monorepo itself', () => {
  it('keeps generated supabase config and env examples in sync with the port registry', async () => {
    const { lines, log } = capture();
    expect(await run(['--check'], { root: REPO, log })).toBe(0);
    expect(lines).toEqual(['check: ports in sync']);
  });
});

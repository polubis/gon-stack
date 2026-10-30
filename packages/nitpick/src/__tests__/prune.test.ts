import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from '../run.js';

const SKILL = '---\nname: s\ndescription: d\n---\n\nbody\n';

const init = (root: string) =>
  execFileSync('git', ['init', '-q'], { cwd: root, stdio: 'ignore' });

const project = async (output = '') => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-prune-'));
  const files: Record<string, string> = {
    '.nitpick/config.ts': `export default {
  ${output}
  agents: { a: { doc: 'agent' } },
  skills: { s: { source: './skills/s' } },
  refs: { r: './r.md' },
  rules: { g: { x: { importance: 'A', doc: 'do x' } } },
};`,
    '.nitpick/r.md': 'ref',
    '.nitpick/skills/s/SKILL.md': SKILL,
  };
  for (const [name, text] of Object.entries(files)) {
    await mkdir(dirname(join(root, name)), { recursive: true });
    await writeFile(join(root, name), text);
  }
  init(root);
  return root;
};

const put = async (root: string, name: string) => {
  await mkdir(dirname(join(root, name)), { recursive: true });
  await writeFile(join(root, name), 'x');
};

const has = (root: string, name: string) => existsSync(join(root, name));

let errors: string[];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, 'error').mockImplementation((message: string) => {
    errors.push(message);
  });
});
afterEach(() => vi.restoreAllMocks());

describe('Stale generated files work when', () => {
  it('sync removes stale rule, agent, reference and skill files', async () => {
    const root = await project();
    await run(['--sync'], root);
    const stale = [
      '.ai/rules/old.md',
      '.ai/agents/old.md',
      '.ai/references/old.md',
      '.ai/skills/s/old.md',
    ];
    for (const name of stale) await put(root, name);

    expect(await run(['--sync'], root)).toBe(0);

    for (const name of stale) expect(has(root, name)).toBe(false);
    expect(has(root, '.ai/skills/s/SKILL.md')).toBe(true);
    expect(await run(['--check'], root)).toBe(0);
  });

  it('check reports each stale file', async () => {
    const root = await project();
    await run(['--sync'], root);
    await put(root, '.ai/rules/old.md');
    await put(root, '.ai/skills/gone/SKILL.md');

    expect(await run(['--check'], root)).toBe(1);

    expect(errors).toEqual([
      expect.stringMatching(/rules.old\.md is stale, run nitpick --sync$/),
      expect.stringMatching(
        /skills.gone.SKILL\.md is stale, run nitpick --sync$/,
      ),
    ]);
  });

  it('sync removes the directory of a deleted skill', async () => {
    const root = await project();
    await run(['--sync'], root);
    await put(root, '.ai/skills/gone/references/deep/a.md');

    await run(['--sync'], root);

    expect(has(root, '.ai/skills/gone')).toBe(false);
    expect(has(root, '.ai/skills/s')).toBe(true);
  });

  it('sync leaves unrelated files in the output dir alone', async () => {
    const root = await project();
    await put(root, '.ai/keep.txt');
    await put(root, '.ai/other/keep.txt');
    await put(root, '.ai/settings.local.json');

    await run(['--sync'], root);

    expect(has(root, '.ai/keep.txt')).toBe(true);
    expect(has(root, '.ai/other/keep.txt')).toBe(true);
    expect(has(root, '.ai/settings.local.json')).toBe(true);
    expect(await run(['--check'], root)).toBe(0);
  });

  it('sync works when managed dirs are missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'nitpick-prune-'));
    await mkdir(join(root, '.nitpick'));
    await writeFile(
      join(root, '.nitpick', 'config.ts'),
      'export default { rules: {} };',
    );
    init(root);

    expect(await run(['--sync'], root)).toBe(0);
    expect(await run(['--check'], root)).toBe(0);
  });

  it('sync never prunes when the output path is the project root', async () => {
    const root = await project("output: [{ path: '.', root: 'AGENTS.md' }],");
    await put(root, 'rules/mine.md');

    await run(['--sync'], root);

    expect(has(root, 'rules/mine.md')).toBe(true);
    expect(await run(['--check'], root)).toBe(0);
  });

  it('sync never prunes when the output path is outside the project', async () => {
    const outside = `nitpick-outside-${Date.now()}`;
    const root = await project(
      `output: [{ path: '../${outside}', root: 'AGENTS.md' }],`,
    );
    const target = join(root, '..', outside);
    await put(target, 'rules/mine.md');

    await run(['--sync'], root);

    expect(has(target, 'rules/mine.md')).toBe(true);
    await rm(target, { recursive: true });
  });
});

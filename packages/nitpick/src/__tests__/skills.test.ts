import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';
import { config } from '../config.js';
import type { Config } from '../config.js';
import { buildDocs } from '../docs.js';
import { run } from '../run.js';

const SKILL = '---\nname: demo\ndescription: "Does demo"\n---\n\n# Demo\n';
const BINARY = Buffer.from([0, 255, 13, 10, 128]);

const project = async (files: Record<string, string | Buffer>) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-skill-'));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, name)), { recursive: true });
    await writeFile(join(root, name), content);
  }
  return root;
};

const build = async (
  files: Record<string, string | Buffer>,
  skills: Config['skills'] = { demo: { source: './skills/demo' } },
  rules: Config['rules'] = {},
) => {
  const root = await project(files);
  const result = buildDocs({ rules, skills }, join(root, '.nitpick'), root);
  return {
    ...result,
    read: (...parts: string[]) => result.files.get(join(root, ...parts)),
  };
};

describe('Skills work when', () => {
  it('copy the whole tree under the skill folder', async () => {
    const { problems, read } = await build({
      '.nitpick/skills/demo/SKILL.md': SKILL,
      '.nitpick/skills/demo/references/a.md': 'a\r\nb',
      '.nitpick/skills/demo/assets/f.bin': BINARY,
    });
    expect(problems).toEqual([]);
    expect(read('.ai', 'skills', 'demo', 'SKILL.md')).toBe(SKILL);
    expect(read('.ai', 'skills', 'demo', 'references', 'a.md')).toBe('a\nb');
    expect(read('.ai', 'skills', 'demo', 'assets', 'f.bin')).toEqual(BINARY);
  });

  it('are listed in the root file and linkable by ref', async () => {
    const { read } = await build(
      { '.nitpick/skills/demo/SKILL.md': SKILL },
      { demo: { source: './skills/demo' } },
      { g: { r: { importance: 'A', doc: ({ ref }) => `see ${ref('demo')}` } } },
    );
    expect(read('.ai', 'AGENTS.md')).toContain(
      '## Skill files\n\n- [skills/demo/SKILL.md](skills/demo/SKILL.md)\n',
    );
    expect(read('.ai', 'rules', 'g.md')).toContain(
      '[demo](../skills/demo/SKILL.md)',
    );
  });

  it('report a missing source directory', async () => {
    const { problems } = await build({});
    expect(problems).toEqual([
      expect.stringContaining('Skill "demo": missing directory'),
    ]);
  });

  it('report a missing SKILL.md', async () => {
    const { problems } = await build({ '.nitpick/skills/demo/x.md': 'x' });
    expect(problems).toEqual(['Skill "demo": missing SKILL.md']);
  });

  it('report frontmatter without name and description', async () => {
    const { problems } = await build({
      '.nitpick/skills/demo/SKILL.md': '# Demo\n',
    });
    expect(problems).toEqual([
      'Skill "demo": frontmatter needs name',
      'Skill "demo": frontmatter needs description',
    ]);
  });

  it('report a name that differs from the id', async () => {
    const { problems } = await build({
      '.nitpick/skills/demo/SKILL.md':
        '---\nname: other\ndescription: d\n---\n',
    });
    expect(problems).toEqual([
      'Skill "demo": frontmatter name differs from id',
    ]);
  });

  it('report an id shared with a rule', async () => {
    const { problems } = await build(
      { '.nitpick/skills/demo/SKILL.md': SKILL },
      { demo: { source: './skills/demo' } },
      { g: { demo: { importance: 'A', doc: 'x' } } },
    );
    expect(problems).toEqual(['Duplicate id "demo"']);
  });
});

describe('Skills contract works when', () => {
  it('throws on an id shared by a skill and an agent', () => {
    expect(() =>
      config({
        rules: {},
        agents: { x: { doc: 'x' } },
        skills: { x: { source: './x' } },
      }),
    ).toThrow('Duplicate unit id "x"');
  });

  it('suggests skill ids in ref', () => {
    config({
      rules: {
        g: {
          r: {
            importance: 'A',
            doc: ({ ref }) => {
              expectTypeOf(ref).parameter(0).toEqualTypeOf<'r' | 'demo'>();
              return ref('demo');
            },
          },
        },
      },
      skills: { demo: { source: './demo' } },
    });
  });
});

describe('Skills sync and check work when', () => {
  let errors: string[];
  beforeEach(() => {
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((message: string) => {
      errors.push(message);
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const synced = async () => {
    const root = await project({
      '.nitpick/config.ts': `export default { rules: {}, skills: { demo: { source: './skills/demo' } } };`,
      '.nitpick/skills/demo/SKILL.md': SKILL,
      '.nitpick/skills/demo/f.bin': BINARY,
    });
    execFileSync('git', ['init', '-q'], { cwd: root });
    await run(['--sync'], root);
    return root;
  };

  it('write binary files byte for byte and pass the check', async () => {
    const root = await synced();
    expect(await readFile(join(root, '.ai/skills/demo/f.bin'))).toEqual(BINARY);
    expect(await run(['--check'], root)).toBe(0);
  });

  it('flag a changed binary and a missing file', async () => {
    const root = await synced();
    await writeFile(join(root, '.ai/skills/demo/f.bin'), 'x');
    await writeFile(join(root, '.nitpick/skills/demo/new.md'), 'n');
    expect(await run(['--check'], root)).toBe(1);
    expect(
      errors.map((e) => e.replaceAll(String.fromCharCode(92), '/')),
    ).toEqual([
      '[sync] .ai/skills/demo/f.bin is out of date, run nitpick --sync',
      '[sync] .ai/skills/demo/new.md is out of date, run nitpick --sync',
    ]);
  });
});

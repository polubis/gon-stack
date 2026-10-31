import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '../config.js';
import type { Config } from '../config.js';
import { AODI_LEGEND, buildDocs } from '../docs.js';

const A = 'A' as const;

const build = async (value: Config, sources: Record<string, string> = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-'));
  await mkdir(join(root, '.nitpick'), { recursive: true });
  for (const [name, text] of Object.entries(sources)) {
    await mkdir(join(root, '.nitpick', name, '..'), { recursive: true });
    await writeFile(join(root, '.nitpick', name), text);
  }
  const result = buildDocs(value, join(root, '.nitpick'), root);
  return {
    ...result,
    keys: [...result.files.keys()].map((key) => key.slice(root.length + 1)),
    read: (...parts: string[]) => result.files.get(join(root, ...parts)),
  };
};

const oneRule = (doc: Config['rules'][string][string]['doc']): Config => ({
  rules: { g: { r: { importance: A, doc } } },
});

describe('Root docs work when', () => {
  it('start with the default heading', async () => {
    const { read } = await build({ rules: {} });
    expect(read('.ai', 'AGENTS.md')).toBe('# Information for AI\n');
  });

  it('are replaced by an entry string', async () => {
    const { read } = await build({
      rules: {},
      entry: { doc: '\n# Own\n\n' },
    });
    expect(read('.ai', 'AGENTS.md')).toBe('# Own\n');
  });

  it('are replaced by an entry callback with header and links', async () => {
    const { read, problems } = await build({
      rules: { g: { r: { importance: A, doc: 'x' } } },
      entry: { doc: ({ header, ref }) => `${header} ${ref('r')}` },
    });
    expect(problems).toEqual([]);
    expect(read('.ai', 'AGENTS.md')).toBe(
      `# Information for AI [r](rules/g.md)\n\n## Rule files\n\n${AODI_LEGEND}\n\n- [rules/g.md](rules/g.md)\n`,
    );
  });

  it('are replaced by an entry file with resolved refs', async () => {
    const { read, problems } = await build(
      {
        rules: {},
        refs: { k: './k.md' },
        entry: { doc: { file: './entry.md' } },
      },
      { 'entry.md': '# E {{ref:k}}\r\n', 'k.md': 'k' },
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'AGENTS.md')).toBe(
      '# E [k](references/k.md)\n\n## Reference files\n\n- [references/k.md](references/k.md)\n',
    );
  });

  it('report a missing entry file and write an empty entry', async () => {
    const { read, problems } = await build({
      rules: {},
      entry: { doc: { file: './gone.md' } },
    });
    expect(problems).toEqual(['Entry: missing file ./gone.md']);
    expect(read('.ai', 'AGENTS.md')).toBe('\n');
  });
});

describe('Rule groups work when', () => {
  it('renders a group file with tagged numbered rules in config order', async () => {
    const { read, keys } = await build({
      rules: {
        git: {
          late: { importance: 'I', doc: 'third' },
          first: { importance: A, doc: 'first' },
        },
        ui: { x: { importance: 'D', doc: 'x' } },
      },
    });
    expect(read('.ai', 'rules', 'git.md')).toBe(
      '## Git\n\n1. (I) third\n2. (A) first\n',
    );
    expect(read('.ai', 'AGENTS.md')).toContain(
      `## Rule files\n\n${AODI_LEGEND}\n\n- [rules/git.md](rules/git.md)\n- [rules/ui.md](rules/ui.md)\n`,
    );
    expect(keys).toEqual([
      join('.ai', 'AGENTS.md'),
      join('.ai', 'rules', 'git.md'),
      join('.ai', 'rules', 'ui.md'),
    ]);
  });

  it('derives the title from the group key', async () => {
    const { read } = await build({
      rules: { 'unit-testing': { r: { importance: A, doc: 'x' } } },
    });
    expect(read('.ai', 'rules', 'unit-testing.md')).toBe(
      '## Unit Testing\n\n1. (A) x\n',
    );
  });

  it('reports bad group names', async () => {
    const { problems } = await build({
      rules: {
        'bad name': { r: { importance: A, doc: 'x' } },
        same: { same: { importance: A, doc: 'x' } },
      },
    });
    expect(problems).toEqual([
      'Group "bad name": use letters, digits, "_" or "-"',
      'Group "same": same name as a rule id file',
    ]);
  });
});

describe('Rule docs work when', () => {
  it('inline strings and callbacks in the group file', async () => {
    const { read } = await build({
      rules: {
        g: {
          a: { importance: A, doc: 'plain' },
          b: { importance: A, doc: ({ ref }) => `to ${ref('a')}` },
        },
      },
    });
    expect(read('.ai', 'rules', 'g.md')).toBe(
      '## G\n\n1. (A) plain\n2. (A) to [a](g.md)\n',
    );
  });

  it('write a file doc as its own file and link it from the group', async () => {
    const { read, problems } = await build(
      {
        rules: { g: { r: { importance: A, doc: { file: './r.md' } } } },
        refs: { 'x/k': './k.md' },
      },
      { 'r.md': 'see {{ref:x/k}} and {{ref:x/k}}\r\n', 'k.md': '' },
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'rules', 'g.md')).toContain('1. (A) [r](r.md)');
    expect(read('.ai', 'rules', 'r.md')).toBe(
      'see [x/k](../references/x/k.md) and [x/k](../references/x/k.md)\n',
    );
    expect(read('.ai', 'AGENTS.md')).not.toContain('r.md');
  });

  it('report a missing doc file and unknown refs per occurrence', async () => {
    const { problems } = await build(
      {
        rules: {
          g: {
            a: { importance: A, doc: { file: './gone.md' } },
            b: { importance: A, doc: { file: './b.md' } },
          },
        },
      },
      { 'b.md': '{{ref:q}} {{ref:q}}' },
    );
    expect(problems).toEqual([
      'Rule "a": missing file ./gone.md',
      'Rule "b": unknown ref "q"',
      'Rule "b": unknown ref "q"',
    ]);
  });

  it('require fix next to run', async () => {
    const { problems } = await build({
      rules: {
        g: {
          a: { importance: A, doc: 'a', run: () => {} },
          b: { importance: A, doc: 'b', run: () => {}, fix: 'f' },
        },
      },
    } as unknown as Config);
    expect(problems).toEqual(['Rule "a": fix is required when run is defined']);
  });

  it('report ref ids and file keys that are unknown at runtime', async () => {
    const { problems, read } = await build(
      oneRule(({ ref, file }) => `${ref('ghost')} ${file('nope')}`),
    );
    expect(problems).toEqual([
      'Rule "r": unknown ref "ghost"',
      'Rule "r": unknown ref "nope"',
    ]);
    expect(read('.ai', 'rules', 'g.md')).toContain('ghost nope');
  });
});

describe('Insert works when', () => {
  it('inlines a trimmed file with LF endings and resolved refs', async () => {
    const { read, problems } = await build(
      {
        rules: {
          g: {
            r: {
              importance: A,
              doc: ({ insert }) => `a ${insert('i')} b`,
            },
          },
        },
        refs: { i: './i.md', k: './k.md' },
      },
      { 'i.md': '\r\nbody {{ref:k}}\r\n\r\n', 'k.md': 'k' },
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'rules', 'g.md')).toContain(
      '1. (A) a body [k](../references/k.md) b',
    );
  });

  it('lowers headings one level and keeps fenced code as is', async () => {
    const { read } = await build(
      {
        rules: {},
        agents: { a: { doc: ({ insert }) => insert('i') } },
        refs: { i: './i.md' },
      },
      { 'i.md': '# T\n\n```md\n# keep\n```\n\n## S\n' },
    );
    expect(read('.ai', 'agents', 'a.md')).toBe(
      '## T\n\n```md\n# keep\n```\n\n### S\n',
    );
  });

  it('reports an unknown key at runtime', async () => {
    const { problems } = await build(
      oneRule(({ insert }) => insert('ghost' as never)),
    );
    expect(problems).toEqual(['Rule "r": unknown ref "ghost"']);
  });

  it('reports a missing file and inlines nothing', async () => {
    const { read, problems } = await build({
      rules: {},
      agents: { a: { doc: ({ insert }) => `[${insert('gone')}]` } },
      refs: { gone: './gone.md' },
    });
    expect(problems).toEqual(['Knowledge "gone": missing file ./gone.md']);
    expect(read('.ai', 'agents', 'a.md')).toBe('[]\n');
  });
});

describe('Agents work when', () => {
  it('writes one file per agent and lists them in the root', async () => {
    const { read, problems } = await build(
      {
        rules: { g: { r: { importance: A, doc: 'r' } } },
        agents: {
          plain: { doc: ' Plain ' },
          fn: { doc: ({ ref }) => `to ${ref('plain')} ${ref('r')}` },
          file: { doc: { file: './a.md' } },
        },
      },
      { 'a.md': 'from file' },
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'agents', 'plain.md')).toBe('Plain\n');
    expect(read('.ai', 'agents', 'fn.md')).toBe(
      'to [plain](plain.md) [r](../rules/g.md)\n',
    );
    expect(read('.ai', 'agents', 'file.md')).toBe('from file\n');
    expect(read('.ai', 'AGENTS.md')).toContain(
      '## Agent files\n\n- [agents/plain.md](agents/plain.md)\n- [agents/fn.md](agents/fn.md)\n- [agents/file.md](agents/file.md)\n',
    );
  });

  it('renders frontmatter before the body', async () => {
    const { read } = await build({
      rules: {},
      agents: {
        a: { doc: 'Body', frontmatter: { name: 'a', description: 'An agent' } },
      },
    });
    expect(read('.ai', 'agents', 'a.md')).toBe(
      '---\nname: a\ndescription: An agent\n---\n\nBody\n',
    );
  });

  it('writes an empty body for a missing doc file', async () => {
    const { read, problems } = await build({
      rules: {},
      agents: { a: { doc: { file: './gone.md' } } },
    });
    expect(problems).toEqual(['Agent "a": missing file ./gone.md']);
    expect(read('.ai', 'agents', 'a.md')).toBe('\n');
  });

  it('reports an id shared by rules and agents', async () => {
    const { problems } = await build({
      rules: {
        a: { x: { importance: A, doc: '1' } },
        b: { x: { importance: A, doc: '2' } },
      },
      agents: { x: { doc: '3' } },
    });
    expect(problems).toEqual(['Duplicate id "x"', 'Duplicate id "x"']);
  });
});

describe('Table of contents works when', () => {
  const agents = { a: { doc: 'Body' } };
  const skills = { demo: { source: './skills/demo' } };
  const sources = {
    'skills/demo/SKILL.md':
      '---\nname: demo\ndescription: "Does demo"\n---\n\n# Demo\n',
  };

  it('lists agents and skills by default', async () => {
    const { read, problems } = await build(
      { rules: {}, agents, skills },
      sources,
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'AGENTS.md')).toContain('## Agent files');
    expect(read('.ai', 'AGENTS.md')).toContain('## Skill files');
  });

  it('hides the agent list but still writes agent files', async () => {
    const { read, problems } = await build({
      rules: {},
      agents,
      output: [{ path: '.ai', root: 'AGENTS.md', toc: { agents: false } }],
    });
    expect(problems).toEqual([]);
    expect(read('.ai', 'AGENTS.md')).not.toContain('## Agent files');
    expect(read('.ai', 'agents', 'a.md')).toBe('Body\n');
  });

  it('hides the skill list but still copies skill files', async () => {
    const { read, problems } = await build(
      {
        rules: {},
        skills,
        output: [{ path: '.ai', root: 'AGENTS.md', toc: { skills: false } }],
      },
      sources,
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'AGENTS.md')).not.toContain('## Skill files');
    expect(read('.ai', 'skills', 'demo', 'SKILL.md')).toContain('# Demo');
  });
});

describe('Refs work when', () => {
  it('link nested keys relative to their own folders and keep lookalikes', async () => {
    const { read, problems } = await build(
      { rules: {}, refs: { 'x/a': './a.md', b: './b.md', c: './c.md' } },
      {
        'a.md': '{{ref:b}} {{ref:b}}',
        'b.md': '{{ref:}} {{ref: b}} {{ref:x/a}}',
        'c.md': '',
      },
    );
    expect(problems).toEqual(['Reference cycle: x/a -> b -> x/a']);
    expect(read('.ai', 'references', 'x', 'a.md')).toBe(
      '[b](../b.md) [b](../b.md)',
    );
    expect(read('.ai', 'references', 'b.md')).toBe(
      '{{ref:}} {{ref: b}} [x/a](x/a.md)',
    );
    expect(read('.ai', 'references', 'c.md')).toBe('');
  });

  it('allow a diamond and report a self reference, unknown refs and cycles once', async () => {
    const diamond = await build(
      {
        rules: {},
        refs: { a: './a.md', b: './b.md', c: './c.md', d: './d.md' },
      },
      {
        'a.md': '{{ref:b}}{{ref:c}}',
        'b.md': '{{ref:d}}',
        'c.md': '{{ref:d}}',
        'd.md': '',
      },
    );
    expect(diamond.problems).toEqual([]);
    const bad = await build(
      { rules: {}, refs: { a: './a.md', b: './b.md' } },
      { 'a.md': '{{ref:a}} {{ref:x}}', 'b.md': '{{ref:a}}' },
    );
    expect(bad.problems).toEqual([
      'Knowledge "a": references itself',
      'Knowledge "a": unknown ref "x"',
    ]);
  });

  it('report a missing file only once', async () => {
    const { problems } = await build({ rules: {}, refs: { a: './gone.md' } });
    expect(problems).toEqual(['Knowledge "a": missing file ./gone.md']);
  });
});

describe('Outputs work when', () => {
  const setup = (output: { path: string; root: string }[]) =>
    build(
      {
        output,
        rules: { g: { x: { importance: A, doc: { file: './x.md' } } } },
        refs: { k: './k.md' },
      },
      { 'k.md': 'leaf', 'x.md': 'x' },
    );

  it('writes full docs only for the first output', async () => {
    const { problems, keys, read } = await setup([
      { path: '.ai', root: 'CLAUDE.md' },
      { path: '.ai', root: 'AGENTS.md' },
    ]);
    expect(problems).toEqual([]);
    expect(keys).toEqual([
      join('.ai', 'CLAUDE.md'),
      join('.ai', 'rules', 'g.md'),
      join('.ai', 'rules', 'x.md'),
      join('.ai', 'references', 'k.md'),
      join('.ai', 'AGENTS.md'),
    ]);
    expect(read('.ai', 'rules', 'g.md')).toContain('1. (A) [x](x.md)');
  });

  it('makes every next output reference the first one', async () => {
    const { read } = await setup([
      { path: '.ai', root: 'CLAUDE.md' },
      { path: '.ai', root: 'AGENTS.md' },
      { path: 'docs/nested', root: 'RULES.md' },
    ]);
    expect(read('.ai', 'AGENTS.md')).toBe(
      'Follow instructions here: [CLAUDE.md](CLAUDE.md)\n',
    );
    expect(read('docs', 'nested', 'RULES.md')).toBe(
      'Follow instructions here: [CLAUDE.md](../../.ai/CLAUDE.md)\n',
    );
  });

  it('falls back to the default output for an empty list', async () => {
    const { read } = await setup([]);
    expect(read('.ai', 'AGENTS.md')).toContain('## Rule files');
  });

  it('reports the written path of each rule', async () => {
    const { rulePaths } = await build(
      {
        output: [{ path: 'out\\dir', root: 'R.md' }],
        rules: {
          g: {
            a: { importance: A, doc: 'a' },
            b: { importance: A, doc: { file: './b.md' } },
          },
        },
      },
      { 'b.md': 'b' },
    );
    expect(Object.fromEntries(rulePaths)).toEqual({
      a: 'out/dir/rules/g.md',
      b: 'out/dir/rules/b.md',
    });
  });
});

describe('Settings generation works when', () => {
  const setup = async (settings: Config['settings']) => {
    const { files, problems, keys } = await build({
      output: [
        { path: 'out', root: 'A.md' },
        { path: 'other', root: 'B.md' },
      ],
      settings,
      rules: {},
    });
    return { files, problems, keys };
  };
  const find = (keys: string[], name: string) =>
    keys.find((key) => key.endsWith(name));

  it('writes settings only under the first output', async () => {
    const { files, keys, problems } = await setup({
      permissions: { allow: ['Bash(ls)'] },
      env: { MODE: 'dev' },
    });
    expect(problems).toEqual([]);
    expect(keys.filter((key) => key.includes('settings'))).toHaveLength(1);
    expect(
      [...files].find(([file]) => file.endsWith('settings.json'))?.[1],
    ).toBe(
      '{\n  "permissions": {\n    "allow": [\n      "Bash(ls)"\n    ]\n  },\n  "env": {\n    "MODE": "dev"\n  }\n}\n',
    );
    expect(find(keys, '.mcp.json')).toBeUndefined();
  });

  it('uses the local name and passes extra keys through', async () => {
    const { files } = await setup({
      name: 'settings.local.json',
      model: 'opus',
    });
    expect(
      [...files].find(([file]) => file.endsWith('settings.local.json'))?.[1],
    ).toBe('{\n  "model": "opus"\n}\n');
  });

  it('writes .mcp.json and enables its servers', async () => {
    const { files, problems } = await setup({
      mcp: {
        local: { command: 'npx', args: ['x'], env: { TOKEN: '${TOKEN}' } },
        remote: { type: 'http', url: 'https://a.b', headers: { A: '${A:-x}' } },
      },
    });
    expect(problems).toEqual([]);
    const text = (name: string) =>
      String([...files].find(([file]) => file.endsWith(name))?.[1] ?? '');
    expect(JSON.parse(text('.mcp.json'))).toEqual({
      mcpServers: {
        local: { command: 'npx', args: ['x'], env: { TOKEN: '${TOKEN}' } },
        remote: { type: 'http', url: 'https://a.b', headers: { A: '${A:-x}' } },
      },
    });
    expect(JSON.parse(text('settings.json'))).toEqual({
      enabledMcpjsonServers: ['local', 'remote'],
    });
  });

  it('skips .mcp.json for empty mcp', async () => {
    const { keys } = await setup({ mcp: {} });
    expect(find(keys, '.mcp.json')).toBeUndefined();
  });

  it('reports literal secrets, bad name and empty server name', async () => {
    const { problems } = await setup({
      name: 'x.json' as 'settings.json',
      env: { API_KEY: 'abc', LONG: 'abcdefghijklmnopqrstuvwxyz' },
      mcp: {
        ' ': { command: 'a', env: { SECRET: 'x' } },
        r: { type: 'sse', url: 'u', headers: { Authorization: 'Bearer x' } },
      },
    });
    expect(problems).toEqual([
      'Settings name "x.json": use settings.json or settings.local.json',
      'Settings mcp: empty server name',
      'Settings mcp " " env "SECRET": looks like a literal secret, use ${VAR} expansion',
      'Settings mcp "r" headers "Authorization": looks like a literal secret, use ${VAR} expansion',
      'Settings env "API_KEY": looks like a literal secret, use ${VAR} expansion',
      'Settings env "LONG": looks like a literal secret, use ${VAR} expansion',
    ]);
  });
});

describe('Config helper works when', () => {
  it('returns the given rules untouched', () => {
    const value = config({ rules: { g: { r: { importance: A, doc: 'x' } } } });
    expect(Object.keys(value.rules)).toEqual(['g']);
  });
});

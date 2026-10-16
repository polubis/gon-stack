import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '../config.js';
import { AODI_LEGEND, buildDocs } from '../docs.js';

const setup = async (knowledge: Record<string, string>) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-'));
  await mkdir(join(root, '.nitpick'), { recursive: true });
  for (const [name, text] of Object.entries(knowledge)) {
    await writeFile(join(root, '.nitpick', name), text);
  }
  return root;
};

describe('Docs generation works when', () => {
  it('numbers rules in config order and defaults to A', async () => {
    const root = await setup({});
    const { files } = await buildDocs(
      config({
        output: [{ path: 'out', root: 'RULES.md' }],
        rules: ({ rule }) => [
          rule({ id: 'late', importance: 'I', instruction: () => 'third' }),
          rule({ id: 'first', instruction: () => 'first' }),
        ],
      }),
      join(root, '.nitpick'),
      root,
    );
    const text = files.get(join(root, 'out', 'RULES.md')) ?? '';
    expect(text).toContain('1. (I) third\n2. (A) first');
  });

  it('links refs and writes knowledge files', async () => {
    const root = await setup({ 'a.md': 'see {{ref:b}}', 'b.md': 'leaf' });
    const { files, problems } = await buildDocs(
      config({
        output: [{ path: 'out', root: 'RULES.md' }],
        knowledge: { refs: { a: './a.md', b: './b.md' } },
        rules: ({ rule }) => [
          rule({ id: 'x', instruction: ({ ref }) => `read ${ref('a')}` }),
        ],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual([]);
    expect(files.get(join(root, 'out', 'RULES.md'))).toContain(
      '[a](references/a.md)',
    );
    expect(files.get(join(root, 'out', 'references', 'a.md'))).toBe(
      'see [b](b.md)',
    );
  });

  it('reports missing files, self refs and cycles', async () => {
    const root = await setup({
      'a.md': '{{ref:b}}',
      'b.md': '{{ref:a}}',
      'c.md': '{{ref:c}}',
    });
    const { problems } = await buildDocs(
      config({
        knowledge: {
          refs: { a: './a.md', b: './b.md', c: './c.md', d: './nope.md' },
        },
        rules: () => [],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual([
      'Knowledge "d": missing file ./nope.md',
      'Knowledge "c": references itself',
      'Reference cycle: a -> b -> a',
    ]);
  });
});

describe('Instruction files work when', () => {
  it('links the rule to a generated markdown file with resolved refs', async () => {
    const root = await setup({ 'a.md': 'leaf', 'x.md': 'read {{ref:a}}' });
    const { files, problems } = await buildDocs(
      config({
        output: [{ path: 'out', root: 'RULES.md' }],
        knowledge: { refs: { a: './a.md' } },
        rules: [{ id: 'x', instruction: { file: './x.md' } }],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual([]);
    expect(files.get(join(root, 'out', 'RULES.md'))).toContain(
      '1. (A) [x](rules/x.md)',
    );
    expect(files.get(join(root, 'out', 'rules', 'x.md'))).toBe(
      'read [a](../references/a.md)',
    );
  });

  it('reports missing files and unknown refs', async () => {
    const root = await setup({ 'y.md': '{{ref:ghost}}' });
    const { problems } = await buildDocs(
      config({
        rules: [
          { id: 'x', instruction: { file: './nope.md' } },
          { id: 'y', instruction: { file: './y.md' } },
        ],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual([
      'Rule "x": missing file ./nope.md',
      'Rule "y": unknown ref "ghost"',
    ]);
  });
});

describe('Rule groups work when', () => {
  const build = async (rules: Parameters<typeof config>[0]['rules']) => {
    const root = await setup({ 'a.md': 'a text' });
    const result = await buildDocs(
      config({ output: [{ path: 'out', root: 'RULES.md' }], rules }),
      join(root, '.nitpick'),
      root,
    );
    return {
      ...result,
      read: (...parts: string[]) => result.files.get(join(root, ...parts)),
      text: result.files.get(join(root, 'out', 'RULES.md')) ?? '',
      keys: [...result.files.keys()].map((key) => key.slice(root.length + 1)),
    };
  };

  it('renders ungrouped rules under a plain Rules heading', async () => {
    const { text } = await build([{ id: 'x', instruction: () => 'y' }]);
    expect(text).toBe(
      '# Information for AI\n\n' + AODI_LEGEND + '\n\n## Rules\n\n1. (A) y\n',
    );
  });

  it('renders a group as its own file with tagged numbered rules', async () => {
    const { text, read } = await build([
      { id: 'a', group: 'git', instruction: () => 'one' },
      { id: 'b', group: 'git', importance: 'I', instruction: () => 'two' },
    ]);
    expect(text).toBe(
      '# Information for AI\n\n' +
        AODI_LEGEND +
        '\n\n## Rule files\n\n- [rules/git.md](rules/git.md)\n',
    );
    expect(read('out', 'rules', 'git.md')).toBe(
      '## Git\n\n1. (A) one\n2. (I) two\n',
    );
  });

  it('keeps ungrouped rules in the root and groups in order of appearance', async () => {
    const { text } = await build([
      { id: 'g1', group: 'git', instruction: () => '1' },
      { id: 'f1', group: 'files', instruction: () => '2' },
      { id: 'x', instruction: () => '3' },
    ]);
    const at = (heading: string) => text.indexOf(heading);
    expect(at('1. (A) 3')).toBeLessThan(at('## Rule files'));
    expect(at('rules/git.md')).toBeLessThan(at('rules/files.md'));
  });

  it('links instruction files from the group file and keeps their path', async () => {
    const { read, keys } = await build([
      { id: 'a', group: 'git', instruction: { file: './a.md' } },
    ]);
    expect(read('out', 'rules', 'git.md')).toContain('1. (A) [a](a.md)');
    expect(keys).toEqual([
      join('out', 'RULES.md'),
      join('out', 'rules', 'git.md'),
      join('out', 'rules', 'a.md'),
    ]);
  });

  it('links knowledge from the group file relative to rules', async () => {
    const root = await setup({ 'k.md': 'leaf' });
    const { files, problems } = await buildDocs(
      config({
        knowledge: { refs: { k: './k.md' } },
        rules: [{ id: 'a', group: 'git', instruction: ({ ref }) => ref('k') }],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual([]);
    expect(files.get(join(root, '.ai', 'rules', 'git.md'))).toContain(
      '1. (A) [k](../references/k.md)',
    );
  });

  it('reports a group named like a rule file and an unsafe group name', async () => {
    const { problems } = await build([
      { id: 'git', instruction: { file: './a.md' } },
      { id: 'b', group: 'git', instruction: () => '1' },
      { id: 'c', group: '../x', instruction: () => '2' },
    ]);
    expect(problems).toEqual([
      'Group "git": same name as a rule id file',
      'Group "../x": use letters, digits, "_" or "-"',
    ]);
  });
});

describe('Rules as array work when', () => {
  it('accepts a plain list', async () => {
    const root = await setup({});
    const { files } = await buildDocs(
      config({ rules: [{ id: 'x', instruction: () => 'y' }] }),
      join(root, '.nitpick'),
      root,
    );
    expect([...files.values()][0]).toContain('1. (A) y');
  });
});

describe('Default output works when', () => {
  it('writes .ai/AGENTS.md without output config', async () => {
    const root = await setup({});
    const { files } = await buildDocs(
      config({
        rules: ({ rule }) => [rule({ id: 'x', instruction: () => 'y' })],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect([...files.keys()]).toEqual([join(root, '.ai', 'AGENTS.md')]);
  });
});

describe('Ref validation works when', () => {
  it('reports unknown refs in knowledge and in instructions', async () => {
    const root = await setup({ 'a.md': '{{ref:ghost}}' });
    const { problems } = await buildDocs(
      config({
        knowledge: { refs: { a: './a.md' } },
        rules: [{ id: 'x', instruction: ({ ref }) => ref('nope' as 'a') }],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual([
      'Knowledge "a": unknown ref "ghost"',
      'Rule instruction: unknown ref "nope"',
    ]);
  });

  it('reports duplicate rule ids', async () => {
    const root = await setup({});
    const { problems } = await buildDocs(
      config({
        rules: [
          { id: 'x', instruction: () => 'a' },
          { id: 'x', instruction: () => 'b' },
        ],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect(problems).toEqual(['Duplicate rule id "x"']);
  });

  it('writes knowledge under a custom dir', async () => {
    const root = await setup({ 'a.md': 'leaf' });
    const { files } = await buildDocs(
      config({
        knowledge: { dir: 'kb', refs: { 'x/a': './a.md' } },
        rules: [],
      }),
      join(root, '.nitpick'),
      root,
    );
    expect([...files.keys()]).toContain(join(root, '.ai', 'kb', 'x', 'a.md'));
  });
});

describe('Multiple outputs work when', () => {
  const build = async (output: { path: string; root: string }[]) => {
    const root = await setup({ 'k.md': 'leaf', 'x.md': 'x' });
    const { files, problems } = await buildDocs(
      config({
        output,
        knowledge: { refs: { k: './k.md' } },
        rules: [{ id: 'x', instruction: { file: './x.md' } }],
      }),
      join(root, '.nitpick'),
      root,
    );
    return {
      problems,
      files,
      keys: [...files.keys()].map((key) => key.slice(root.length + 1)),
      read: (...parts: string[]) => files.get(join(root, ...parts)),
    };
  };

  it('writes full docs only for the first output', async () => {
    const { problems, keys, read } = await build([
      { path: '.ai', root: 'CLAUDE.md' },
      { path: '.ai', root: 'AGENTS.md' },
    ]);
    expect(problems).toEqual([]);
    expect(keys).toEqual([
      join('.ai', 'CLAUDE.md'),
      join('.ai', 'rules', 'x.md'),
      join('.ai', 'references', 'k.md'),
      join('.ai', 'AGENTS.md'),
    ]);
    expect(read('.ai', 'CLAUDE.md')).toContain('1. (A) [x](rules/x.md)');
  });

  it('makes every next output reference the first one', async () => {
    const { read } = await build([
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
});

describe('Settings generation works when', () => {
  const build = async (settings: Parameters<typeof config>[0]['settings']) => {
    const root = await setup({});
    const docs = await buildDocs(
      config({
        output: [
          { path: 'out', root: 'A.md' },
          { path: 'other', root: 'B.md' },
        ],
        settings,
        rules: () => [],
      }),
      join(root, '.nitpick'),
      root,
    );
    return { root, ...docs };
  };

  it('writes settings only under the first output', async () => {
    const { root, files, problems } = await build({
      permissions: { allow: ['Bash(ls)'] },
      env: { MODE: 'dev' },
    });
    expect(problems).toEqual([]);
    expect(files.get(join(root, 'out', 'settings.json'))).toBe(
      '{\n  "permissions": {\n    "allow": [\n      "Bash(ls)"\n    ]\n  },\n  "env": {\n    "MODE": "dev"\n  }\n}\n',
    );
    expect(files.has(join(root, 'other', 'settings.json'))).toBe(false);
    expect(files.has(join(root, '.mcp.json'))).toBe(false);
  });

  it('uses the local name and passes extra keys through', async () => {
    const { root, files } = await build({
      name: 'settings.local.json',
      model: 'opus',
    });
    expect(files.get(join(root, 'out', 'settings.local.json'))).toBe(
      '{\n  "model": "opus"\n}\n',
    );
  });

  it('writes .mcp.json and enables its servers', async () => {
    const { root, files, problems } = await build({
      mcp: {
        local: { command: 'npx', args: ['x'], env: { TOKEN: '${TOKEN}' } },
        remote: { type: 'http', url: 'https://a.b', headers: { A: '${A:-x}' } },
      },
    });
    expect(problems).toEqual([]);
    expect(JSON.parse(files.get(join(root, '.mcp.json')) ?? '')).toEqual({
      mcpServers: {
        local: { command: 'npx', args: ['x'], env: { TOKEN: '${TOKEN}' } },
        remote: { type: 'http', url: 'https://a.b', headers: { A: '${A:-x}' } },
      },
    });
    expect(
      JSON.parse(files.get(join(root, 'out', 'settings.json')) ?? ''),
    ).toEqual({ enabledMcpjsonServers: ['local', 'remote'] });
  });

  it('skips .mcp.json for empty mcp', async () => {
    const { root, files } = await build({ mcp: {} });
    expect(files.has(join(root, '.mcp.json'))).toBe(false);
  });

  it('reports literal secrets, bad name and empty server name', async () => {
    const { problems } = await build({
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

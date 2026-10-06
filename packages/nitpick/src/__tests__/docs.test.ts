import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '../config.js';
import { buildDocs } from '../docs.js';

const setup = async (knowledge: Record<string, string>) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-'));
  await mkdir(join(root, '.nitpick'), { recursive: true });
  for (const [name, text] of Object.entries(knowledge)) {
    await writeFile(join(root, '.nitpick', name), text);
  }
  return root;
};

describe('Docs generation works when', () => {
  it('orders rules by importance and defaults to A', async () => {
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
    expect(text.indexOf('first')).toBeLessThan(text.indexOf('third'));
    expect(text).toContain('### (A) Always');
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
      '- [x](rules/x.md)',
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
      text: result.files.get(join(root, 'out', 'RULES.md')) ?? '',
      keys: [...result.files.keys()].map((key) => key.slice(root.length + 1)),
    };
  };

  it('renders ungrouped rules under a plain Rules heading', async () => {
    const { text } = await build([{ id: 'x', instruction: () => 'y' }]);
    expect(text).toBe(
      '# Information for AI\n\n## Rules\n\n### (A) Always\n\n- `x`: y\n',
    );
  });

  it('renders a group as its own area with importance sections', async () => {
    const { text } = await build([
      { id: 'a', group: 'git', instruction: () => 'one' },
      { id: 'b', group: 'git', importance: 'I', instruction: () => 'two' },
    ]);
    expect(text).toBe(
      '# Information for AI\n\n## Rules for Git\n\n### (A) Always\n\n- `a`: one\n\n### (I) Infer during task\n\n- `b`: two\n',
    );
  });

  it('puts ungrouped rules first and keeps group order of appearance', async () => {
    const { text } = await build([
      { id: 'g1', group: 'git', instruction: () => '1' },
      { id: 'f1', group: 'files', instruction: () => '2' },
      { id: 'x', instruction: () => '3' },
    ]);
    const at = (heading: string) => text.indexOf(heading);
    expect(at('## Rules\n')).toBeLessThan(at('## Rules for Git'));
    expect(at('## Rules for Git')).toBeLessThan(at('## Rules for Files'));
  });

  it('does not affect where instruction files are written', async () => {
    const { text, keys } = await build([
      { id: 'a', group: 'git', instruction: { file: './a.md' } },
    ]);
    expect(text).toContain('- [a](rules/a.md)');
    expect(keys).toEqual([
      join('out', 'RULES.md'),
      join('out', 'rules', 'a.md'),
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
    expect([...files.values()][0]).toContain('- `x`: y');
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
    expect(read('.ai', 'CLAUDE.md')).toContain('- [x](rules/x.md)');
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

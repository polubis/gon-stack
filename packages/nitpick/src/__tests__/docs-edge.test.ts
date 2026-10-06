import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '../config.js';
import type { Config, Rule } from '../config.js';
import { buildDocs } from '../docs.js';

type Output = { path: string; root: string };

const setup = async (texts: Record<string, string> = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-edge-'));
  await mkdir(join(root, '.nitpick'), { recursive: true });
  for (const [name, text] of Object.entries(texts)) {
    await writeFile(join(root, '.nitpick', name), text);
  }
  return root;
};

const build = async (
  texts: Record<string, string>,
  value: Config<string>,
  root?: string,
) => {
  const dir = root ?? (await setup(texts));
  const result = await buildDocs(value, join(dir, '.nitpick'), dir);
  return {
    ...result,
    root: dir,
    keys: [...result.files.keys()].map((key) => key.slice(dir.length + 1)),
    read: (...parts: string[]) => result.files.get(join(dir, ...parts)),
    first: [...result.files.values()][0],
  };
};

const inline = (id: string, extra: Partial<Rule> = {}): Rule => ({
  id,
  instruction: () => id,
  ...extra,
});

const file = (id: string, path: string, extra: Partial<Rule> = {}): Rule => ({
  id,
  instruction: { file: path },
  ...extra,
});

describe('Root docs layout works when', () => {
  const render = async (rules: Rule[]) =>
    (await build({}, config({ rules }))).read('.ai', 'AGENTS.md');

  it('renders only the heading when there are no rules', async () => {
    expect(await render([])).toBe('# Information for AI\n');
  });

  it('renders all importance sections in A, O, D, I order', async () => {
    expect(
      await render([
        inline('i', { importance: 'I' }),
        inline('d', { importance: 'D' }),
        inline('o', { importance: 'O' }),
        inline('a', { importance: 'A' }),
      ]),
    ).toBe(
      [
        '# Information for AI',
        '## Rules\n\n### (A) Always\n\n- `a`: a',
        '### (O) Optional\n\n- `o`: o',
        '### (D) When directly mentioned\n\n- `d`: d',
        '### (I) Infer during task\n\n- `i`: i',
      ].join('\n\n') + '\n',
    );
  });

  it('keeps config order of rules inside one section', async () => {
    const text = (await render([inline('second'), inline('first')])) ?? '';
    expect(text.indexOf('second')).toBeLessThan(text.indexOf('first'));
  });

  it('capitalizes only the first letter of a group', async () => {
    const text = await render([
      inline('a', { group: 'x' }),
      inline('b', { group: 'myArea' }),
    ]);
    expect(text).toContain('## Rules for X\n');
    expect(text).toContain('## Rules for MyArea\n');
  });

  it('lists ungrouped rules first even when configured last', async () => {
    const text =
      (await render([inline('g', { group: 'git' }), inline('u')])) ?? '';
    expect(text.indexOf('## Rules\n')).toBeLessThan(
      text.indexOf('## Rules for Git'),
    );
  });

  it('omits the plain Rules heading when every rule is grouped', async () => {
    expect(await render([inline('g', { group: 'git' })])).not.toContain(
      '## Rules\n',
    );
  });

  it('renders each group once even when its rules are not adjacent', async () => {
    const text =
      (await render([
        inline('a', { group: 'git' }),
        inline('b', { group: 'ui' }),
        inline('c', { group: 'git' }),
      ])) ?? '';
    expect(text.match(/## Rules for Git/g)).toHaveLength(1);
    expect(text.indexOf('`c`')).toBeLessThan(text.indexOf('Rules for Ui'));
  });

  it('renders function instructions in groups with their id', async () => {
    expect(await render([inline('a', { group: 'git' })])).toContain('- `a`: a');
  });

  it('treats an empty group name as no group', async () => {
    expect(await render([inline('a', { group: '' })])).toContain('## Rules\n');
  });
});

describe('Refs work when', () => {
  const run = (
    texts: Record<string, string>,
    refs: Record<string, string>,
    rules: Rule[] = [],
    dir?: string,
  ) =>
    build(
      texts,
      config({ knowledge: { refs, ...(dir ? { dir } : {}) }, rules }),
    );

  it('links nested keys relative to their own folders', async () => {
    const { read, problems } = await run(
      {
        'a.md': '{{ref:x/c}} {{ref:y/b}} {{ref:top}}',
        'b.md': '',
        'c.md': '',
        't.md': '',
      },
      { 'x/a': './a.md', 'x/c': './c.md', 'y/b': './b.md', top: './t.md' },
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'references', 'x', 'a.md')).toBe(
      '[x/c](c.md) [y/b](../y/b.md) [top](../top.md)',
    );
  });

  it('replaces every occurrence of the same ref', async () => {
    const { read } = await run(
      { 'a.md': '{{ref:b}} and {{ref:b}}', 'b.md': 'leaf' },
      { a: './a.md', b: './b.md' },
    );
    expect(read('.ai', 'references', 'a.md')).toBe('[b](b.md) and [b](b.md)');
  });

  it('keeps text that only looks like a ref', async () => {
    const text = '{{ref:}} {{ref: b}} {{ ref:b}} {ref:b} {{REF:b}}';
    const { read, problems } = await run(
      { 'a.md': text, 'b.md': '' },
      { a: './a.md', b: './b.md' },
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'references', 'a.md')).toBe(text);
  });

  it('copies files without refs and empty ones unchanged', async () => {
    const { read } = await run(
      { 'a.md': '# Title\n\ntext\n', 'b.md': '' },
      { a: './a.md', b: './b.md' },
    );
    expect(read('.ai', 'references', 'a.md')).toBe('# Title\n\ntext\n');
    expect(read('.ai', 'references', 'b.md')).toBe('');
  });

  it('allows a diamond of refs without reporting a cycle', async () => {
    const { problems } = await run(
      {
        'a.md': '{{ref:b}}{{ref:c}}',
        'b.md': '{{ref:d}}',
        'c.md': '{{ref:d}}',
        'd.md': '',
      },
      { a: './a.md', b: './b.md', c: './c.md', d: './d.md' },
    );
    expect(problems).toEqual([]);
  });

  it('reports a long cycle once with its full path', async () => {
    const { problems } = await run(
      { 'a.md': '{{ref:b}}', 'b.md': '{{ref:c}}', 'c.md': '{{ref:a}}' },
      { a: './a.md', b: './b.md', c: './c.md' },
    );
    expect(problems).toEqual(['Reference cycle: a -> b -> c -> a']);
  });

  it('reports a cycle reachable from an acyclic entry', async () => {
    const { problems } = await run(
      { 'e.md': '{{ref:a}}', 'a.md': '{{ref:b}}', 'b.md': '{{ref:a}}' },
      { e: './e.md', a: './a.md', b: './b.md' },
    );
    expect(problems).toEqual(['Reference cycle: a -> b -> a']);
  });

  it('reports a ref to a key with a missing file only as a missing file', async () => {
    const { problems } = await run(
      { 'a.md': '{{ref:b}}' },
      { a: './a.md', b: './nope.md' },
    );
    expect(problems).toEqual(['Knowledge "b": missing file ./nope.md']);
  });

  it('reports each unknown ref occurrence', async () => {
    const { problems } = await run(
      { 'a.md': '{{ref:x}} {{ref:y}}' },
      { a: './a.md' },
    );
    expect(problems).toEqual([
      'Knowledge "a": unknown ref "x"',
      'Knowledge "a": unknown ref "y"',
    ]);
  });

  it('links refs from instructions relative to the root docs and custom dir', async () => {
    const { first, problems } = await run(
      { 'a.md': 'leaf' },
      { 'x/a': './a.md' },
      [{ id: 'r', instruction: ({ ref }) => ref('x/a') }],
      'kb',
    );
    expect(problems).toEqual([]);
    expect(first).toContain('- `r`: [x/a](kb/x/a.md)');
  });

  it('returns the key and reports a problem for an unknown instruction ref', async () => {
    const { first, problems } = await run({}, {}, [
      { id: 'r', instruction: ({ ref }) => ref('ghost') },
    ]);
    expect(first).toContain('- `r`: ghost');
    expect(problems).toEqual(['Rule instruction: unknown ref "ghost"']);
  });

  it('supports several refs in one instruction', async () => {
    const { first } = await run(
      { 'a.md': '', 'b.md': '' },
      { a: './a.md', b: './b.md' },
      [{ id: 'r', instruction: ({ ref }) => `${ref('a')} + ${ref('b')}` }],
    );
    expect(first).toContain(
      '- `r`: [a](references/a.md) + [b](references/b.md)',
    );
  });
});

describe('Instruction files work when', () => {
  const run = (
    texts: Record<string, string>,
    rules: Rule[],
    refs: Record<string, string> = {},
  ) => build(texts, config({ knowledge: { refs }, rules }));

  it('resolves a relative path outside .nitpick', async () => {
    const root = await setup();
    await writeFile(join(root, 'outside.md'), 'out');
    const { read, problems } = await build(
      {},
      config({ rules: [file('r', '../outside.md')] }),
      root,
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'rules', 'r.md')).toBe('out');
  });

  it('accepts an absolute path', async () => {
    const other = await mkdtemp(join(tmpdir(), 'nitpick-abs-'));
    await writeFile(join(other, 'abs.md'), 'absolute');
    const { read, problems } = await run({}, [
      file('r', join(other, 'abs.md')),
    ]);
    expect(problems).toEqual([]);
    expect(read('.ai', 'rules', 'r.md')).toBe('absolute');
  });

  it('reports a directory given as a file', async () => {
    const root = await setup();
    await mkdir(join(root, '.nitpick', 'dir'));
    const { problems } = await build(
      {},
      config({ rules: [file('r', './dir')] }),
      root,
    );
    expect(problems).toEqual(['Rule "r": missing file ./dir']);
  });

  it('keeps an empty instruction file', async () => {
    const { read, problems } = await run({ 'e.md': '' }, [file('r', './e.md')]);
    expect(problems).toEqual([]);
    expect(read('.ai', 'rules', 'r.md')).toBe('');
  });

  it('replaces refs to nested knowledge relative to the rules folder', async () => {
    const { read } = await run(
      { 'r.md': 'a {{ref:x/y}} b', 'k.md': '' },
      [file('r', './r.md')],
      { 'x/y': './k.md' },
    );
    expect(read('.ai', 'rules', 'r.md')).toBe(
      'a [x/y](../references/x/y.md) b',
    );
  });

  it('reports unknown refs once per occurrence', async () => {
    const { problems } = await run({ 'r.md': '{{ref:g}} {{ref:g}}' }, [
      file('r', './r.md'),
    ]);
    expect(problems).toEqual([
      'Rule "r": unknown ref "g"',
      'Rule "r": unknown ref "g"',
    ]);
  });

  it('reports every missing file separately', async () => {
    const { problems } = await run({}, [
      file('a', './a.md'),
      file('b', './b.md'),
    ]);
    expect(problems).toEqual([
      'Rule "a": missing file ./a.md',
      'Rule "b": missing file ./b.md',
    ]);
  });

  it('allows two rules to share one source file', async () => {
    const { keys, problems } = await run({ 's.md': 'shared' }, [
      file('a', './s.md'),
      file('b', './s.md'),
    ]);
    expect(problems).toEqual([]);
    expect(keys).toEqual([
      join('.ai', 'AGENTS.md'),
      join('.ai', 'rules', 'a.md'),
      join('.ai', 'rules', 'b.md'),
    ]);
  });

  it('mixes function and file instructions in one section', async () => {
    const { first } = await run({ 'f.md': 'text' }, [
      inline('a'),
      file('b', './f.md'),
    ]);
    expect(first).toContain('- `a`: a\n- [b](rules/b.md)');
  });
});

describe('Rule ids work when', () => {
  it('reports every extra duplicate across groups', async () => {
    const { problems } = await build(
      {},
      config({
        rules: [inline('x'), inline('x', { group: 'g' }), inline('x')],
      }),
    );
    expect(problems).toEqual([
      'Duplicate rule id "x"',
      'Duplicate rule id "x"',
    ]);
  });
});

describe('Outputs work when', () => {
  const run = (output?: Output[]) =>
    build(
      { 'r.md': 'r' },
      config({ ...(output ? { output } : {}), rules: [file('r', './r.md')] }),
    );

  it('falls back to the default output for an empty list', async () => {
    const { keys } = await run([]);
    expect(keys).toEqual([
      join('.ai', 'AGENTS.md'),
      join('.ai', 'rules', 'r.md'),
    ]);
  });

  it('writes a single output as full docs only', async () => {
    const { keys } = await run([{ path: 'a/b', root: 'DOCS.md' }]);
    expect(keys).toEqual([
      join('a', 'b', 'DOCS.md'),
      join('a', 'b', 'rules', 'r.md'),
    ]);
  });

  it('links a root-level reference to a nested first output', async () => {
    const { read } = await run([
      { path: 'a/b', root: 'CLAUDE.md' },
      { path: '.', root: 'AGENTS.md' },
    ]);
    expect(read('AGENTS.md')).toBe(
      'Follow instructions here: [CLAUDE.md](a/b/CLAUDE.md)\n',
    );
  });

  it('links sibling folders through their common parent', async () => {
    const { read } = await run([
      { path: '.ai', root: 'A.md' },
      { path: '.claude', root: 'B.md' },
    ]);
    expect(read('.claude', 'B.md')).toBe(
      'Follow instructions here: [A.md](../.ai/A.md)\n',
    );
  });

  it('adds no extra rule or knowledge files for next outputs', async () => {
    const { keys } = await run([
      { path: 'one', root: 'A.md' },
      { path: 'two', root: 'B.md' },
      { path: 'three', root: 'C.md' },
    ]);
    expect(keys).toEqual([
      join('one', 'A.md'),
      join('one', 'rules', 'r.md'),
      join('two', 'B.md'),
      join('three', 'C.md'),
    ]);
  });
});

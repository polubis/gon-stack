import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { config } from '../config.js';
import { buildDocs } from '../docs.js';

const build = async (value: ReturnType<typeof config>) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-'));
  const result = buildDocs(value, join(root, '.nitpick'), root);
  return {
    ...result,
    read: (...path: string[]) => result.files.get(join(root, ...path)),
  };
};

describe('Config contract types work when', () => {
  it('suggests every rule and agent id in ref and every refs key in file', () => {
    config({
      rules: {
        a11y: {
          kb: { importance: 'A', doc: () => 'kb' },
          wcag: {
            importance: 'A',
            doc: ({ ref, file }) => {
              expectTypeOf(ref)
                .parameter(0)
                .toEqualTypeOf<'kb' | 'wcag' | 'style' | 'repo' | 'claude'>();
              expectTypeOf(file).parameter(0).toEqualTypeOf<'guide'>();
              return `${ref('kb')} ${ref('repo')} ${file('guide')}`;
            },
          },
        },
        ui: { style: { importance: 'O', doc: 'plain' } },
      },
      agents: {
        repo: { doc: 'Repo agent' },
        claude: { doc: ({ ref }) => ref('style') },
      },
      refs: { guide: './guide.md' },
    });
  });

  it('types ref when every agent doc is a callback', () => {
    config({
      rules: {
        g: {
          r: {
            importance: 'A',
            doc: ({ ref }) => {
              expectTypeOf(ref).parameter(0).toEqualTypeOf<'r' | 'a' | 'b'>();
              return ref('a');
            },
          },
        },
      },
      agents: {
        a: { doc: ({ ref }) => ref('r') + ref('b') },
        b: { doc: ({ ref }) => ref('a') },
      },
    });
    config({
      rules: { g: { r: { importance: 'A', doc: 'r' } } },
      agents: {
        // @ts-expect-error typo inside an all-callback agents object
        a: { doc: ({ ref }) => ref('nope') },
      },
    });
    config({
      rules: {
        g: {
          // @ts-expect-error typo in a rule next to all-callback agents
          r: { importance: 'A', doc: ({ ref }) => ref('nope') },
        },
      },
      agents: { a: { doc: ({ ref }) => ref('r') } },
    });
  });

  it('rejects a ref typo in rules, agents and entry', () => {
    config({
      rules: {
        // @ts-expect-error unknown rule id
        a: { x: { importance: 'A', doc: ({ ref }) => ref('nope') } },
      },
    });
    config({
      rules: { a: { x: { importance: 'A', doc: 'x' } } },
      // @ts-expect-error unknown id in agent
      agents: { y: { doc: ({ ref }) => ref('nope') } },
    });
    config({
      rules: { a: { x: { importance: 'A', doc: 'x' } } },
      // @ts-expect-error unknown id in entry
      entry: { doc: ({ ref }) => ref('nope') },
    });
  });

  it('rejects a file key that is not in refs', () => {
    config({
      rules: {
        // @ts-expect-error unknown refs key
        a: { x: { importance: 'A', doc: ({ file }) => file('nope') } },
      },
      refs: { guide: './guide.md' },
    });
  });

  it('accepts a string, a file or a callback with insert as doc everywhere', () => {
    config({
      entry: {
        doc: ({ insert, header }) => {
          expectTypeOf(insert).toEqualTypeOf<(key: 'a' | 'c') => string>();
          return `${header}${insert('a')}`;
        },
      },
      rules: {
        g: {
          s: { importance: 'A', doc: 'text' },
          f: { importance: 'A', doc: { file: './f.md' } },
          c: { importance: 'A', doc: ({ insert }) => insert('c') },
        },
      },
      agents: { a: { doc: { file: './a.md' } }, b: { doc: 'b' } },
      refs: { a: './a.md', c: './c.md' },
    });
    config({ rules: {}, entry: { doc: { file: './entry.md' } } });
  });

  it('rejects an insert key that is not in refs and a doc of another type', () => {
    config({
      rules: {
        // @ts-expect-error unknown refs key
        g: { a: { importance: 'A', doc: ({ insert }) => insert('nope') } },
      },
      refs: { guide: './guide.md' },
    });
    config({
      rules: {
        // @ts-expect-error doc cannot be a number
        g: { a: { importance: 'A', doc: 1 } },
      },
    });
  });

  it('rejects unknown and legacy fields', () => {
    config({
      rules: {
        a: {
          // @ts-expect-error legacy field name
          x: { importance: 'A', doc: 'x', instructions: 'x' },
        },
      },
    });
    config({
      // @ts-expect-error unknown top-level field
      knowledge: {},
      rules: { a: { x: { importance: 'A', doc: 'x' } } },
    });
  });

  it('rejects missing fields', () => {
    config({
      rules: {
        // @ts-expect-error doc is required
        a: { x: { importance: 'A' } },
      },
    });
    config({
      rules: {
        // @ts-expect-error importance is required
        a: { x: { doc: 'x' } },
      },
    });
  });

  it('allows run only on rules and requires fix next to it', () => {
    config({
      rules: {
        a: {
          x: { importance: 'A', doc: 'x', run: () => {}, fix: 'how' },
          // @ts-expect-error fix is required with run
          y: { importance: 'A', doc: 'y', run: () => {} },
        },
      },
      agents: {
        // @ts-expect-error agents cannot run
        z: { doc: 'z', run: () => {} },
      },
    });
  });
});

describe('Config contract runtime works when', () => {
  it('throws on an id repeated across groups', () => {
    expect(() =>
      config({
        rules: {
          a: { x: { importance: 'A', doc: 'x' } },
          b: { x: { importance: 'A', doc: 'x' } },
        },
      }),
    ).toThrow('Duplicate unit id "x"');
  });

  it('throws on an id shared by a rule and an agent', () => {
    expect(() =>
      config({
        rules: { a: { x: { importance: 'A', doc: 'x' } } },
        agents: { x: { doc: 'x' } },
      }),
    ).toThrow('Duplicate unit id "x"');
  });

  it('throws on an id shared by an agent and a skill', () => {
    expect(() =>
      config({
        rules: {},
        agents: { x: { doc: 'x' } },
        skills: { x: { doc: 'x' } },
      }),
    ).toThrow('Duplicate unit id "x"');
  });

  it('suggests skill ids in ref and rejects typos', () => {
    config({
      rules: { g: { r: { importance: 'A', doc: ({ ref }) => ref('s') } } },
      skills: { s: { doc: ({ ref }) => ref('r') } },
    });
    config({
      rules: { g: { r: { importance: 'A', doc: 'r' } } },
      skills: {
        // @ts-expect-error unknown id in skill
        s: { doc: ({ ref }) => ref('nope') },
      },
    });
  });

  it('reports a missing refs file in the docs verification step', async () => {
    const { problems } = await build(
      config({
        rules: { a: { x: { importance: 'A', doc: 'x' } } },
        refs: { gone: './gone.md' },
      }),
    );
    expect(problems).toEqual(['Knowledge "gone": missing file ./gone.md']);
  });

  it('survives rules and agents that reference each other', async () => {
    const { problems, read } = await build(
      config({
        rules: {
          g: {
            a: { importance: 'A', doc: ({ ref }) => `to ${ref('b')}` },
            b: { importance: 'A', doc: ({ ref }) => `to ${ref('a')}` },
          },
        },
        agents: {
          me: { doc: ({ ref }) => `see ${ref('me')}` },
        },
      }),
    );
    expect(problems).toEqual([]);
    expect(read('.ai', 'rules', 'g.md')).toContain('1. (A) to [b](g.md)');
    expect(read('.ai', 'agents', 'me.md')).toBe('see [me](me.md)\n');
  });
});

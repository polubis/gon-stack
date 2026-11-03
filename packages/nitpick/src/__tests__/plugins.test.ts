import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from '../config.js';
import type { Config } from '../config.js';
import { buildDocs } from '../docs.js';
import { statusLine } from '../plugins/statusline.js';

const rules = { g: { r: { importance: 'A' as const, doc: 'do r' } } };

const commandOf = (plugin: { settings: object }): string =>
  (plugin.settings as { statusLine: { command: string } }).statusLine.command;

const built = async (value: Config) => {
  const root = await mkdtemp(join(tmpdir(), 'nitpick-plugin-'));
  const docs = buildDocs(value, join(root, '.nitpick'), root);
  return {
    ...docs,
    text: (name: string) =>
      String(docs.files.get(join(root, '.claude', name)) ?? ''),
  };
};

describe('Plugins work when', () => {
  it('writes plugin settings to its own settings file', async () => {
    const { problems, files } = await built({
      output: [{ path: '.claude', root: 'CLAUDE.md' }],
      plugins: [
        {
          id: 'hello',
          settings: {
            name: 'settings.local.json',
            statusLine: { type: 'command', command: 'echo hi' },
          },
        },
      ],
      rules,
    });
    expect(problems).toEqual([]);
    const local = [...files].find(([file]) =>
      file.endsWith('settings.local.json'),
    );
    expect(JSON.parse(local?.[1] as string)).toEqual({
      statusLine: { type: 'command', command: 'echo hi' },
    });
  });

  it('merges plugin and config settings in one file', async () => {
    const { problems, text } = await built({
      output: [{ path: '.claude', root: 'CLAUDE.md' }],
      settings: { permissions: { allow: ['Read'] } },
      plugins: [{ id: 'hello', settings: { env: { A: '1' } } }],
      rules,
    });
    expect(problems).toEqual([]);
    expect(JSON.parse(text('settings.json'))).toEqual({
      permissions: { allow: ['Read'] },
      env: { A: '1' },
    });
  });

  it('reports a key set by both config and plugin', async () => {
    const { problems } = await built({
      output: [{ path: '.claude', root: 'CLAUDE.md' }],
      settings: {
        name: 'settings.local.json',
        statusLine: { type: 'command', command: 'a' },
      },
      plugins: [statusLine()],
      rules,
    });
    expect(problems).toEqual([
      'Settings "statusLine" set twice (plugin "statusline")',
    ]);
  });

  it('reports mcp servers spread over two settings files', async () => {
    const { problems } = await built({
      output: [{ path: '.claude', root: 'CLAUDE.md' }],
      settings: { mcp: { a: { command: 'x' } } },
      plugins: [
        {
          id: 'mcp',
          settings: {
            name: 'settings.local.json',
            mcp: { b: { command: 'y' } },
          },
        },
      ],
      rules,
    });
    expect(problems).toEqual([
      'Settings mcp: set in more than one settings file',
    ]);
  });

  it('reports invalid settings name from a plugin', async () => {
    const { problems } = await built({
      output: [{ path: '.claude', root: 'CLAUDE.md' }],
      plugins: [{ id: 'bad', settings: { name: 'x.json' as 'settings.json' } }],
      rules,
    });
    expect(problems).toEqual([
      'Settings name "x.json": use settings.json or settings.local.json',
    ]);
  });

  it('rejects two plugins with the same id', () => {
    expect(() =>
      config({
        plugins: [statusLine(), statusLine()],
        rules,
      }),
    ).toThrow('Duplicate plugin "statusline"');
  });

  it('writes the built-in status line into settings.local.json', async () => {
    const { problems, files } = await built({
      output: [{ path: '.claude', root: 'CLAUDE.md' }],
      plugins: [statusLine({ limits: { daily: 20, weekly: 100 } })],
      rules,
    });
    expect(problems).toEqual([]);
    const local = [...files].find(([file]) =>
      file.endsWith('settings.local.json'),
    );
    const { statusLine: line } = JSON.parse(local?.[1] as string) as {
      statusLine: { command: string };
    };
    expect(line.command).toMatch(
      /^node "[^"]*statusline-bin\.js" --daily-limit 20 --weekly-limit 100$/,
    );
  });
});

describe('Status line plugin works when', () => {
  it('runs without limits', () => {
    const plugin = statusLine();
    expect(plugin.id).toBe('statusline');
    expect(plugin.settings.name).toBe('settings.local.json');
    expect(commandOf(plugin)).toMatch(/statusline-bin\.js"$/);
  });

  it('passes only the limits that are given', () => {
    expect(commandOf(statusLine({ limits: { weekly: 50 } }))).toMatch(
      /statusline-bin\.js" --weekly-limit 50$/,
    );
  });

  it('skips a limit that is not set', () => {
    expect(
      commandOf(statusLine({ limits: { daily: undefined, weekly: 5 } })),
    ).toMatch(/statusline-bin.js" --weekly-limit 5$/);
  });

  it('rejects a limit that is not a positive number', () => {
    expect(() => statusLine({ limits: { daily: 0 } })).toThrow(
      'statusLine daily limit must be a positive number',
    );
    expect(() => statusLine({ limits: { weekly: Number.NaN } })).toThrow(
      'statusLine weekly limit must be a positive number',
    );
  });
});

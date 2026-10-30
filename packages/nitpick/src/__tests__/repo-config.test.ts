import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { config } from '../config.js';
import type { Config } from '../config.js';
import { buildDocs } from '../docs.js';

const configDir = join(import.meta.dirname, '..', '..', '..', '..', '.nitpick');
const { default: repo } = (await import(
  pathToFileURL(join(configDir, 'config.ts')).href
)) as { default: Config };

describe('Repo config works when', () => {
  const built = async () => {
    const root = await mkdtemp(join(tmpdir(), 'nitpick-'));
    const docs = buildDocs(repo, configDir, root);
    return {
      ...docs,
      read: (...path: string[]) => docs.files.get(join(root, ...path)) ?? '',
    };
  };

  it('builds without verification problems', async () => {
    expect((await built()).problems).toEqual([]);
  });

  it('renders worker with frontmatter', async () => {
    const worker = (await built()).read('.claude', 'agents', 'worker.md');
    expect(worker).toContain('name: worker');
    expect(worker).not.toContain('coord');
  });

  it('writes the built-in AODI reference from the package', async () => {
    const aodi = (await built()).read(
      '.claude',
      'references',
      'aodi-framework.md',
    );
    expect(aodi).toContain('| `A` | always');
  });

  it('rejects a ref typo to a peer agent at compile time', () => {
    config({
      rules: { g: { r: { importance: 'A', doc: 'r' } } },
      agents: {
        worker: { doc: 'w' },
        doctor: {
          // @ts-expect-error unknown agent id
          doc: ({ ref }) => ref('wroker'),
        },
      },
    });
  });
});

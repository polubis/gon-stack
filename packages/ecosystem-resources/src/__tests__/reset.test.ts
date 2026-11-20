import { type ChildProcess, spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { EcosystemConfig } from '../config.ts';
import { listeningPids, reset } from '../reset.ts';
import { nodeSystem, type RunResult, type System } from '../system.ts';

const exists = (path: string): Promise<boolean> =>
  access(path).then(
    () => true,
    () => false,
  );

const freePort = (): Promise<number> =>
  new Promise((resolve) => {
    const server = createServer();
    server.listen(0, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });

const listen = async (port: number): Promise<ChildProcess> => {
  const child = spawn(
    process.execPath,
    [
      '-e',
      `require('net').createServer().listen(${port},()=>console.log('up'));setInterval(()=>{},1e3)`,
    ],
    { stdio: ['ignore', 'pipe', 'ignore'] },
  );
  await new Promise((resolve) => child.stdout!.once('data', resolve));
  return child;
};

const ctx = (
  config: EcosystemConfig,
  root: string,
  system: System,
  dryRun = false,
) => {
  const lines: string[] = [];
  return {
    lines,
    context: {
      config,
      root,
      system,
      dryRun,
      log: (line: string) => lines.push(line),
    },
  };
};

describe('reset on a real directory and real listeners', () => {
  let root: string;
  const children: ChildProcess[] = [];

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'eco-reset-'));
    for (const dir of [
      '.evidences/VYB-1',
      'apps/a/test-results',
      'apps/a/playwright-report',
      'packages/b/blob-report',
      'apps/a/src',
    ])
      await mkdir(join(root, dir), { recursive: true });
    await writeFile(join(root, '.evidences/VYB-1/proof.png'), 'x');
    await writeFile(join(root, '.evidences/factory.lock'), 'VYB-1');
    await writeFile(join(root, 'apps/a/src/keep.ts'), 'x');
  });
  afterEach(async () => {
    for (const child of children.splice(0)) child.kill('SIGKILL');
    await rm(root, { recursive: true, force: true });
  });

  const config = (ports: number[]): EcosystemConfig => ({
    clean: {
      paths: [
        '.evidences',
        '{apps,packages}/*/test-results',
        '{apps,packages}/*/playwright-report',
        '{apps,packages}/*/blob-report',
      ],
      keep: ['.evidences/factory.lock'],
    },
    databases: [],
    ports,
  });

  it('removes evidences and playwright output but keeps the factory lock and sources', async () => {
    const { context } = ctx(config([]), root, nodeSystem());

    expect(await reset(context)).toBe(true);

    expect(await exists(join(root, '.evidences/VYB-1'))).toBe(false);
    expect(await exists(join(root, 'apps/a/test-results'))).toBe(false);
    expect(await exists(join(root, 'apps/a/playwright-report'))).toBe(false);
    expect(await exists(join(root, 'packages/b/blob-report'))).toBe(false);
    expect(await exists(join(root, '.evidences/factory.lock'))).toBe(true);
    expect(await exists(join(root, 'apps/a/src/keep.ts'))).toBe(true);
  });

  it('kills the process holding a registry port and reports the port free', async () => {
    const port = await freePort();
    children.push(await listen(port));
    const system = nodeSystem();
    expect(await system.isFree(port)).toBe(false);
    const { context, lines } = ctx(config([port]), root, system);

    expect(await reset(context)).toBe(true);

    expect(await system.isFree(port)).toBe(true);
    expect(lines.join('\n')).toContain(`${port}: freed`);
  });

  it('dry run lists the work and changes nothing', async () => {
    const port = await freePort();
    children.push(await listen(port));
    const system = nodeSystem();
    const { context, lines } = ctx(config([port]), root, system, true);

    expect(await reset(context)).toBe(true);

    expect(await exists(join(root, '.evidences/VYB-1/proof.png'))).toBe(true);
    expect(await system.isFree(port)).toBe(false);
    expect(lines.join('\n')).toContain('would remove .evidences');
    expect(lines.join('\n')).toContain(`would free ${port}`);
  });

  it('finds the listener pid of a busy port', async () => {
    const port = await freePort();
    const child = await listen(port);
    children.push(child);

    expect(await listeningPids(nodeSystem(), port)).toContain(child.pid);
  });

  it('never kills its own process even when it owns the busy port', async () => {
    const port = await freePort();
    const own = createServer();
    await new Promise<void>((resolve) => own.listen(port, resolve));
    try {
      const { context, lines } = ctx(config([port]), root, nodeSystem());

      expect(await reset(context)).toBe(false);

      expect(lines.join('\n')).toContain(
        `${port}: STILL BUSY (held by reset itself`,
      );
      expect(own.listening).toBe(true);
    } finally {
      own.close();
    }
  });
});

describe('reset databases with a fake system', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'eco-db-'));
    await mkdir(join(root, 'apps/a/supabase'), { recursive: true });
    await writeFile(join(root, 'apps/a/supabase/config.toml'), '');
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  const database = {
    app: 'a',
    dir: 'apps/a',
    ports: {
      api: 1,
      db: 2,
      shadow: 3,
      pooler: 4,
      studio: 5,
      mail: 6,
      analytics: 7,
      inspector: 8,
    },
    dev: 10,
    e2e: 11,
    authPaths: [],
    env: { file: 'x', apiUrlKey: 'K' },
  };
  const config: EcosystemConfig = {
    clean: { paths: [] },
    databases: [database],
    ports: [],
  };
  const fake = (result: RunResult) => {
    const calls: string[][] = [];
    const system: System = {
      ...nodeSystem(),
      run: async (command, args, cwd) => {
        calls.push([command, ...args, String(cwd)]);
        return result;
      },
    };
    return { calls, system };
  };

  it('stops the database wiping its data volumes', async () => {
    const { calls, system } = fake({ status: 0, stdout: '', stderr: '' });
    const { context } = ctx(config, root, system);

    expect(await reset(context)).toBe(true);

    expect(calls).toEqual([
      ['pnpm', 'exec', 'supabase', 'stop', '--no-backup', join(root, 'apps/a')],
    ]);
  });

  it('treats a stopped docker daemon as nothing to stop', async () => {
    const { system } = fake({
      status: 1,
      stdout: '',
      stderr: 'Cannot connect to the Docker daemon',
    });
    const { context, lines } = ctx(config, root, system);

    expect(await reset(context)).toBe(true);
    expect(lines.join('\n')).toContain('docker not running');
  });

  it('fails the reset when the database refuses to stop', async () => {
    const { system } = fake({
      status: 1,
      stdout: '',
      stderr: 'boom\nport conflict',
    });
    const { context, lines } = ctx(config, root, system);

    expect(await reset(context)).toBe(false);
    expect(lines.join('\n')).toContain('a: stop failed: port conflict');
  });

  it('skips apps without a supabase config and never runs the cli in dry run', async () => {
    const { calls, system } = fake({ status: 0, stdout: '', stderr: '' });
    await rm(join(root, 'apps/a/supabase'), { recursive: true });
    expect(await reset(ctx(config, root, system).context)).toBe(true);
    await mkdir(join(root, 'apps/a/supabase'), { recursive: true });
    await writeFile(join(root, 'apps/a/supabase/config.toml'), '');
    expect(await reset(ctx(config, root, system, true).context)).toBe(true);
    expect(calls).toEqual([]);
  });
});

describe('listeningPids parsing', () => {
  const answer = (
    outputs: Record<string, RunResult>,
    platform: NodeJS.Platform,
  ): System => ({
    ...nodeSystem(),
    platform,
    run: async (command) =>
      outputs[command] ?? { status: null, stdout: '', stderr: 'ENOENT' },
  });

  it('reads lsof output', async () => {
    const system = answer(
      { lsof: { status: 0, stdout: '12\n34\n', stderr: '' } },
      'darwin',
    );
    expect(await listeningPids(system, 4303)).toEqual([12, 34]);
  });

  it('falls back to ss when lsof is missing', async () => {
    const stdout = 'LISTEN 0 511 *:4303 *:* users:(("node",pid=777,fd=20))\n';
    const system = answer({ ss: { status: 0, stdout, stderr: '' } }, 'linux');
    expect(await listeningPids(system, 4303)).toEqual([777]);
  });

  it('reads windows netstat and only LISTENING rows of that port', async () => {
    const stdout = [
      '  TCP    0.0.0.0:4303    0.0.0.0:0    LISTENING    4242',
      '  TCP    0.0.0.0:43031   0.0.0.0:0    LISTENING    1',
      '  TCP    127.0.0.1:4303  127.0.0.1:5  ESTABLISHED  9',
    ].join('\n');
    const system = answer(
      { netstat: { status: 0, stdout, stderr: '' } },
      'win32',
    );
    expect(await listeningPids(system, 4303)).toEqual([4242]);
  });
});

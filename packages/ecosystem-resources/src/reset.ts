import { glob, readdir, rm, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import type { Database, EcosystemConfig } from './config.ts';
import type { System } from './system.ts';

export type ResetContext = {
  config: EcosystemConfig;
  root: string;
  system: System;
  dryRun: boolean;
  log: (line: string) => void;
};

const PORT_PID = /pid=(\d+)/g;
const KILL_ROUNDS = 5;
const KILL_WAIT_MS = 300;

const exists = (path: string): Promise<boolean> =>
  stat(path).then(
    () => true,
    () => false,
  );

const inside = (root: string, path: string): boolean => {
  const rel = relative(root, path);
  return rel !== '' && !rel.startsWith('..') && !rel.startsWith(sep);
};

/** Removes `path`, except entries listed in `keep` (absolute paths). */
const removeKeeping = async (
  path: string,
  keep: Set<string>,
): Promise<void> => {
  if (keep.has(path)) return;
  const holdsKept = [...keep].some((kept) => kept.startsWith(path + sep));
  if (!holdsKept) {
    await rm(path, { recursive: true, force: true });
    return;
  }
  for (const entry of await readdir(path))
    await removeKeeping(join(path, entry), keep);
};

const clean = async ({
  config,
  root,
  dryRun,
  log,
}: ResetContext): Promise<boolean> => {
  const keep = new Set(
    (config.clean.keep ?? []).map((path) => resolve(root, path)),
  );
  let count = 0;
  for await (const match of glob(config.clean.paths, { cwd: root })) {
    const path = resolve(root, match);
    // Config already rejects `..`; a symlinked glob result must still stay inside.
    if (!inside(root, path)) continue;
    count += 1;
    log(`  ${dryRun ? 'would remove' : 'removed'} ${match}`);
    if (!dryRun) await removeKeeping(path, keep);
  }
  log(`clean: ${count} path(s)`);
  return true;
};

const dockerDown = (stderr: string): boolean => /docker/i.test(stderr);

const stopDatabase = async (
  database: Database,
  { root, system, dryRun, log }: ResetContext,
): Promise<boolean> => {
  const cwd = join(root, database.dir);
  if (!(await exists(join(cwd, 'supabase/config.toml')))) {
    log(`  ${database.app}: no supabase/config.toml, skipped`);
    return true;
  }
  if (dryRun) {
    log(`  would stop ${database.app} and wipe its data`);
    return true;
  }
  // --no-backup drops the data volumes, so the next start is a fresh database.
  const result = await system.run(
    'pnpm',
    ['exec', 'supabase', 'stop', '--no-backup'],
    cwd,
  );
  if (result.status === 0) {
    log(`  ${database.app}: stopped, data wiped`);
    return true;
  }
  if (dockerDown(result.stderr)) {
    log(`  ${database.app}: docker not running, nothing to stop`);
    return true;
  }
  log(
    `  ${database.app}: stop failed: ${result.stderr.trim().split('\n').at(-1) ?? ''}`,
  );
  return false;
};

const databases = async (context: ResetContext): Promise<boolean> => {
  let ok = true;
  for (const database of context.config.databases)
    ok = (await stopDatabase(database, context)) && ok;
  context.log(`databases: ${context.config.databases.length} checked`);
  return ok;
};

const parsePids = (
  output: string,
  port: number,
  platform: NodeJS.Platform,
): number[] => {
  if (platform === 'win32')
    return output
      .split('\n')
      .filter((line) => /LISTENING/.test(line) && line.includes(`:${port} `))
      .map((line) => Number(line.trim().split(/\s+/).at(-1)));
  return [...output.matchAll(PORT_PID)].map((match) => Number(match[1]));
};

/** Pids listening on `port`: lsof first (macOS), then ss (Linux), netstat (Windows). */
export const listeningPids = async (
  system: System,
  port: number,
): Promise<number[]> => {
  if (system.platform === 'win32') {
    const result = await system.run('netstat', ['-ano', '-p', 'tcp']);
    return parsePids(result.stdout, port, 'win32');
  }
  const lsof = await system.run('lsof', [
    '-nP',
    `-iTCP:${port}`,
    '-sTCP:LISTEN',
    '-t',
  ]);
  if (lsof.status !== null)
    return lsof.stdout.split('\n').filter(Boolean).map(Number);
  const ss = await system.run('ss', ['-H', '-ltnp', `sport = :${port}`]);
  return parsePids(ss.stdout, port, system.platform);
};

const freePort = async (
  port: number,
  { system, log }: ResetContext,
): Promise<boolean> => {
  const owners = (await listeningPids(system, port)).filter(Number.isInteger);
  const pids = owners.filter((pid) => !system.protectedPids.includes(pid));
  for (let round = 0; round < KILL_ROUNDS; round += 1) {
    for (const pid of pids) await system.kill(pid, round >= 2);
    await system.wait(KILL_WAIT_MS);
    if (await system.isFree(port)) {
      log(`  ${port}: freed${pids.length ? ` (pid ${pids.join(', ')})` : ''}`);
      return true;
    }
  }
  const why =
    owners.length === 0
      ? 'owner not visible, try sudo'
      : pids.length === 0
        ? 'held by reset itself or its parent shell, not killed'
        : 'process did not exit';
  log(`  ${port}: STILL BUSY (${why})`);
  return false;
};

const ports = async (context: ResetContext): Promise<boolean> => {
  const { config, system, dryRun, log } = context;
  const busy: number[] = [];
  const free = await Promise.all(
    config.ports.map((port) => system.isFree(port)),
  );
  config.ports.forEach((port, index) => {
    if (!free[index]) busy.push(port);
  });
  let ok = true;
  for (const port of busy) {
    if (dryRun) log(`  would free ${port}`);
    else ok = (await freePort(port, context)) && ok;
  }
  log(`ports: ${config.ports.length} checked, ${busy.length} were busy`);
  return ok;
};

/** Clean folders, stop and wipe databases, free every registry port. */
export const reset = async (context: ResetContext): Promise<boolean> => {
  const results = [
    await clean(context),
    await databases(context),
    // Databases first: stopping them frees the docker-held ports gracefully.
    await ports(context),
  ];
  return results.every(Boolean);
};

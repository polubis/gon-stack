import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

export type RunResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

export type System = {
  platform: NodeJS.Platform;
  /** Processes reset must never kill: itself and its parent shell. */
  protectedPids: number[];
  run: (command: string, args: string[], cwd?: string) => Promise<RunResult>;
  kill: (pid: number, force: boolean) => Promise<void>;
  isFree: (port: number) => Promise<boolean>;
  wait: (ms: number) => Promise<void>;
};

const run = (
  command: string,
  args: string[],
  cwd?: string,
): Promise<RunResult> =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    // Missing binary (ENOENT) resolves as status null so callers can fall back.
    child.on('error', (error) =>
      resolve({ status: null, stdout, stderr: String(error) }),
    );
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });

const kill = async (pid: number, force: boolean): Promise<void> => {
  if (process.platform === 'win32') {
    await run('taskkill', [
      '/PID',
      String(pid),
      '/T',
      ...(force ? ['/F'] : []),
    ]);
    return;
  }
  try {
    process.kill(pid, force ? 'SIGKILL' : 'SIGTERM');
  } catch {
    // Already gone.
  }
};

const isFree = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.listen(port, () => server.close(() => resolve(true)));
  });

export const nodeSystem = (): System => ({
  platform: process.platform,
  protectedPids: [process.pid, process.ppid],
  run,
  kill,
  isFree,
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
});

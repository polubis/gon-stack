#!/usr/bin/env node
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { renderStatusLine } from './statusline-render.js';
import type { SessionInput } from './statusline-render.js';
import { readUsage } from './statusline-usage.js';

const claudeDir = join(homedir(), '.claude');

const readStdin = async (): Promise<string> => {
  if (process.stdin.isTTY) return '';
  let text = '';
  for await (const chunk of process.stdin) text += String(chunk);
  return text;
};

const parseSession = (text: string): SessionInput => {
  try {
    return JSON.parse(text || '{}') as SessionInput;
  } catch {
    return {};
  }
};

const limit = (value: string | undefined): number | undefined => {
  const parsed = Number(value);
  return value !== undefined && Number.isFinite(parsed) && parsed > 0
    ? parsed
    : undefined;
};

const main = async (): Promise<void> => {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'daily-limit': { type: 'string' },
      'weekly-limit': { type: 'string' },
    },
  });
  const session = parseSession(await readStdin());
  const usage = await readUsage({
    projectsDir: join(claudeDir, 'projects'),
    cachePath: join(claudeDir, 'cache', 'nitpick-statusline.json'),
    now: new Date(),
  }).catch(() => null);
  process.stdout.write(
    renderStatusLine({
      session,
      usage,
      limits: {
        daily: limit(values['daily-limit']),
        weekly: limit(values['weekly-limit']),
      },
    }),
  );
};

// A status line must never fail the bar: any error prints a short notice.
await main().catch(() => {
  process.stdout.write('statusline unavailable');
});

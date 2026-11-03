import { fileURLToPath } from 'node:url';
import type { Plugin } from '../config.js';

export type StatusLineOptions = {
  limits?: { daily?: number; weekly?: number };
};

const limitArgs = (limits: StatusLineOptions['limits'] = {}): string[] =>
  Object.entries(limits).flatMap(([period, value]) => {
    if (value === undefined) return [];
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`statusLine ${period} limit must be a positive number`);
    }
    return [`--${period}-limit`, String(value)];
  });

// Built-in plugin: Claude Code status line showing session, daily and weekly
// spend. Runs the compiled `statusline-bin.js` next to this file. Written to
// settings.local.json because the command holds an absolute, per-machine path.
export const statusLine = (options: StatusLineOptions = {}): Plugin => {
  const bin = fileURLToPath(
    new URL('./statusline-bin.js', import.meta.url),
  ).replaceAll('\\', '/');
  const command = ['node', `"${bin}"`, ...limitArgs(options.limits)].join(' ');
  return {
    id: 'statusline',
    settings: {
      name: 'settings.local.json',
      statusLine: { type: 'command', command },
    },
  };
};

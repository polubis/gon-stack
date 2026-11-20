import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import type { EcosystemConfig } from './config.ts';
import { reset } from './reset.ts';
import { driftedFiles } from './sync.ts';
import { nodeSystem, type System } from './system.ts';

const EXIT_OK = 0;
const EXIT_FAILED = 1;
const EXIT_USAGE = 2;
const EXIT_CONFIG = 3;

const USAGE = `Usage: ecosystem <--reset [--dry-run] | --sync | --check>
  --reset    clean evidences/playwright folders, stop + wipe databases, free every port
  --dry-run  with --reset: print what would happen, change nothing
  --sync     regenerate supabase config.toml and .env.example from the port registry
  --check    fail when generated files drift from the registry`;

export type RunOptions = {
  root: string;
  system?: System;
  log?: (line: string) => void;
};

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const run = async (
  args: string[],
  { root, system = nodeSystem(), log = console.log }: RunOptions,
): Promise<number> => {
  let values: {
    reset?: boolean;
    'dry-run'?: boolean;
    sync?: boolean;
    check?: boolean;
  };
  try {
    ({ values } = parseArgs({
      args,
      options: {
        reset: { type: 'boolean' },
        'dry-run': { type: 'boolean' },
        sync: { type: 'boolean' },
        check: { type: 'boolean' },
      },
    }));
  } catch (error) {
    log(`${messageOf(error)}\n${USAGE}`);
    return EXIT_USAGE;
  }
  const modes = [values.reset, values.sync, values.check].filter(
    Boolean,
  ).length;
  if (modes !== 1 || (values['dry-run'] && !values.reset)) {
    log(USAGE);
    return EXIT_USAGE;
  }

  let config: EcosystemConfig;
  try {
    ({ default: config } = (await import(
      pathToFileURL(resolve(root, '.ecosystem/config.ts')).href
    )) as { default: EcosystemConfig });
  } catch (error) {
    log(`Config error: ${messageOf(error)}`);
    return EXIT_CONFIG;
  }

  if (values.reset) {
    const ok = await reset({
      config,
      root,
      system,
      dryRun: Boolean(values['dry-run']),
      log,
    });
    log(ok ? 'reset: clean' : 'reset: FAILED, see above');
    return ok ? EXIT_OK : EXIT_FAILED;
  }

  try {
    const drifted = await driftedFiles(config, root, Boolean(values.sync));
    if (values.sync) {
      log(
        drifted.length ? `synced:\n${drifted.join('\n')}` : 'sync: up to date',
      );
      return EXIT_OK;
    }
    if (drifted.length === 0) {
      log('check: ports in sync');
      return EXIT_OK;
    }
    log(`check: drift, run "pnpm ecosystem:sync":\n${drifted.join('\n')}`);
    return EXIT_FAILED;
  } catch (error) {
    log(`Sync error: ${messageOf(error)}`);
    return EXIT_FAILED;
  }
};

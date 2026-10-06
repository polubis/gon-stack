import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { resolveRules } from './config.js';
import type { Config } from './config.js';
import { buildDocs } from './docs.js';
import { createSnapshot } from './snapshot.js';

const USAGE =
  'Usage: nitpick [--sync | --check] [--commit-msg <file>] [--range <a..b>]';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const readOrNull = (file: string): Promise<string | null> =>
  readFile(file, 'utf8').catch(() => null);

const print = (code: number, problems: string[]): number => {
  for (const problem of problems) console.error(problem);
  return code;
};

export const EXIT_PROBLEMS = 1;
export const EXIT_USAGE = 2;
export const EXIT_CONFIG = 3;

export const run = async (
  argv: string[],
  projectRoot: string,
): Promise<number> => {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        sync: { type: 'boolean' },
        check: { type: 'boolean' },
        'commit-msg': { type: 'string' },
        range: { type: 'string' },
      },
    }));
  } catch (error) {
    return print(EXIT_USAGE, [messageOf(error), USAGE]);
  }
  if (values.sync && values.check) {
    return print(EXIT_USAGE, ['Use either --sync or --check']);
  }

  const configDir = resolve(projectRoot, '.nitpick');
  let config: Config;
  let docs: Awaited<ReturnType<typeof buildDocs>>;
  try {
    ({ default: config } = (await import(
      pathToFileURL(resolve(configDir, 'config.ts')).href
    )) as { default: Config });
    docs = await buildDocs(config, configDir, projectRoot);
  } catch (error) {
    return print(EXIT_CONFIG, [`Config error: ${messageOf(error)}`]);
  }
  if (docs.problems.length > 0) {
    return print(
      EXIT_CONFIG,
      docs.problems.map((problem) => `[config] ${problem}`),
    );
  }

  if (values.sync) {
    for (const [file, content] of docs.files) {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, content);
    }
    return 0;
  }

  const problems: string[] = [];
  for (const [file, content] of docs.files) {
    if ((await readOrNull(file)) !== content) {
      problems.push(
        `[sync] ${relative(projectRoot, file)} is out of date, run nitpick --sync`,
      );
    }
  }

  let snapshot: Awaited<ReturnType<typeof createSnapshot>>;
  try {
    snapshot = await createSnapshot(projectRoot, {
      commitMsgFile: values['commit-msg'],
      range: values.range,
    });
  } catch (error) {
    return print(EXIT_USAGE, [`Cannot read input: ${messageOf(error)}`]);
  }
  for (const rule of resolveRules(config)) {
    try {
      await rule.check?.(
        snapshot.contextFor(rule, (message) => {
          problems.push(`[${rule.id}] ${message}`);
        }),
      );
    } catch (error) {
      problems.push(`[${rule.id}] check failed: ${messageOf(error)}`);
    }
  }

  return problems.length > 0 ? print(EXIT_PROBLEMS, problems) : 0;
};

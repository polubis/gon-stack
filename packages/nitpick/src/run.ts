import {
  mkdir,
  readdir,
  readFile,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { listRules } from './config.js';
import type { Config } from './config.js';
import { buildDocs } from './docs.js';
import { createSnapshot } from './snapshot.js';

const USAGE =
  'Usage: nitpick [--sync | --check] [--commit-msg <file>] [--range <a..b>]';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const readOrNull = (file: string): Promise<Buffer | null> =>
  readFile(file).catch(() => null);

const MANAGED = ['rules', 'agents', 'references', 'skills'];

const listFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? listFiles(join(dir, entry.name))
        : [join(dir, entry.name)],
    ),
  );
  return nested.flat();
};

const isInside = (root: string, dir: string): boolean => {
  const path = relative(root, dir);
  return path !== '' && !path.startsWith('..') && !isAbsolute(path);
};

const staleFiles = async (
  docs: ReturnType<typeof buildDocs>,
  projectRoot: string,
): Promise<string[]> => {
  const output = resolve(docs.outputDir);
  if (!isInside(resolve(projectRoot), output)) return [];
  const expected = new Set([...docs.files.keys()].map((file) => resolve(file)));
  const found = await Promise.all(
    MANAGED.map((name) => listFiles(join(output, name))),
  );
  return found.flat().filter((file) => !expected.has(resolve(file)));
};

const removeEmptyDirs = async (dir: string): Promise<void> => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => removeEmptyDirs(join(dir, entry.name))),
  );
  if ((await readdir(dir).catch(() => ['.'])).length === 0) await rmdir(dir);
};

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
  let docs: ReturnType<typeof buildDocs>;
  try {
    ({ default: config } = (await import(
      pathToFileURL(resolve(configDir, 'config.ts')).href
    )) as { default: Config });
    docs = buildDocs(config, configDir, projectRoot);
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
    for (const file of await staleFiles(docs, projectRoot)) await rm(file);
    for (const name of MANAGED) {
      const dir = join(resolve(docs.outputDir), name);
      if (isInside(resolve(projectRoot), dir)) await removeEmptyDirs(dir);
    }
    return 0;
  }

  const problems: string[] = [];
  for (const [file, content] of docs.files) {
    const actual = await readOrNull(file);
    if (actual === null || !actual.equals(Buffer.from(content))) {
      problems.push(
        `[sync] ${relative(projectRoot, file)} is out of date, run nitpick --sync`,
      );
    }
  }

  for (const file of await staleFiles(docs, projectRoot)) {
    problems.push(
      `[sync] ${relative(projectRoot, file)} is stale, run nitpick --sync`,
    );
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
  for (const rule of listRules(config)) {
    const before = problems.length;
    try {
      await rule.run?.(
        snapshot.contextFor(rule, (message) => {
          problems.push(`[${rule.id}] ${message}`);
        }),
      );
    } catch (error) {
      problems.push(`[${rule.id}] check failed: ${messageOf(error)}`);
    }
    if (problems.length > before) {
      problems.push(
        `Violated rule: ${rule.id}. Read ${docs.rulePaths.get(rule.id)}`,
        `Fix: ${rule.fix}`,
      );
    }
  }

  return problems.length > 0 ? print(EXIT_PROBLEMS, problems) : 0;
};

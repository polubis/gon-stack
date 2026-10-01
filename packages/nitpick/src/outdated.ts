import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import type { CheckResult } from './types.js';

const run = promisify(execFile);

export type OutdatedTarget =
  'latest' | 'newest' | 'greatest' | 'minor' | 'patch' | 'semver';

export type OutdatedRule = {
  /** npm-check-updates `--target`. Default `minor`. */
  target?: OutdatedTarget;
  /** Warn when at least this many unique packages (by name) are outdated. */
  warn?: number;
  /** Fail when at least this many unique packages (by name) are outdated. */
  fail?: number;
  /** Package names never counted by this rule. */
  ignore?: string[];
};

/**
 * One rule or a list of rules (each runs its own `ncu` target and is reported
 * separately). With neither `warn` nor `fail` a rule uses warn 5 / fail 12;
 * setting only one of them disables the other.
 */
export type OutdatedConfig = OutdatedRule | OutdatedRule[];

type Found = Map<string, Set<string>>; // package name -> package.json files

/** Absolute path of the `ncu` entry script installed in the workspace root. */
const ncuBin = (root: string): string => {
  const manifest = createRequire(join(root, 'package.json')).resolve(
    'npm-check-updates/package.json',
  );
  const { bin } = JSON.parse(readFileSync(manifest, 'utf8')) as {
    bin: string | Record<string, string>;
  };
  return join(
    dirname(manifest),
    typeof bin === 'string' ? bin : (bin.ncu ?? ''),
  );
};

/** `ncu --jsonUpgraded` across workspaces: { "<package.json>": { name: newRange } }. */
const upgrades = async (
  root: string,
  target: string,
): Promise<Found | string> => {
  try {
    const { stdout } = await run(
      process.execPath,
      [
        ncuBin(root),
        '--workspaces',
        '--root',
        '--target',
        target,
        '--jsonUpgraded',
      ],
      { cwd: root, maxBuffer: 32 * 1024 * 1024 },
    );
    const parsed = JSON.parse(stdout) as Record<string, Record<string, string>>;
    const found: Found = new Map();
    for (const [file, deps] of Object.entries(parsed)) {
      for (const name of Object.keys(deps)) {
        found.set(name, (found.get(name) ?? new Set()).add(file));
      }
    }
    return found;
  } catch (error) {
    const { stderr, message } = error as { stderr?: string; message: string };
    return (stderr || message).trim();
  }
};

const evaluate = (
  rule: OutdatedRule,
  found: Found | string,
  result: CheckResult,
): void => {
  const target = rule.target ?? 'minor';
  const bare = rule.warn === undefined && rule.fail === undefined;
  const warn = bare ? 5 : (rule.warn ?? Infinity);
  const fail = bare ? 12 : (rule.fail ?? Infinity);
  const limits = `warn from ${warn}, fail from ${fail}`.replaceAll(
    'Infinity',
    'never',
  );
  const update = `ncu -u --workspaces --root --target ${target}`;

  if (typeof found === 'string') {
    // Registry/network flakiness must not break CI: surface, do not fail.
    result.warn = true;
    result.lines.push(
      `WARN  [${target}] could not check for updates (not counted as failure)`,
      `  Cause   : ${found.split('\n')[0]}`,
      `  Fix     : rerun; if persistent run \`pnpm exec ncu --workspaces --root --target ${target}\` and fix the error.`,
    );
    return;
  }

  const ignore = new Set(rule.ignore ?? []);
  const names = [...found.keys()].filter((name) => !ignore.has(name)).sort();
  const list = names.map(
    (name) => `    - ${name} (${[...(found.get(name) ?? [])].join(', ')})`,
  );

  if (names.length >= fail) {
    result.ok = false;
    result.lines.push(
      `FAIL  [${target}] ${names.length} unique packages have ${target} updates (${limits})`,
      `  Expected: fewer than ${fail} outdated package names`,
      '  Found   :',
      ...list,
      `  Fix     : update them (\`${update}\`), run \`pnpm install\` and the tests;`,
      '            or add intentional holds to the rule\'s "ignore" in nitpick.config.mts.',
    );
  } else if (names.length >= warn) {
    result.warn = true;
    result.lines.push(
      `WARN  [${target}] ${names.length} unique packages have ${target} updates (${limits})`,
      '  Found   :',
      ...list,
      `  Fix     : update soon (\`${update}\`), then \`pnpm install\`.`,
    );
  } else {
    result.lines.push(
      `ok    [${target}] ${names.length} outdated unique package(s) (${limits})`,
    );
  }
};

/** Counts unique outdated package names per rule: warn at `warn`, fail at `fail`. */
export const outdated = async (
  root: string,
  config: OutdatedConfig,
): Promise<CheckResult> => {
  const rules = Array.isArray(config) ? config : [config];
  if (rules.length === 0) {
    throw new Error(
      [
        'outdated has no rules',
        '  Expected: a rule or a non-empty list, e.g. outdated: [{ target: "minor", warn: 5, fail: 12 }]',
      ].join('\n'),
    );
  }

  // One ncu run per distinct target, all in parallel.
  const targets = [...new Set(rules.map((rule) => rule.target ?? 'minor'))];
  const found = new Map(
    await Promise.all(
      targets.map(
        async (target) => [target, await upgrades(root, target)] as const,
      ),
    ),
  );

  const result: CheckResult = { name: 'outdated', ok: true, lines: [] };
  for (const rule of rules) {
    evaluate(rule, found.get(rule.target ?? 'minor') ?? 'no result', result);
  }
  return result;
};

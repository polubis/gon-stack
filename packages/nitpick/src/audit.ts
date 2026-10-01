import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { CheckResult } from './types.js';

const run = promisify(exec);
const SEVERITY = ['info', 'low', 'moderate', 'high', 'critical'];

export type AuditLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AuditRule = {
  /** Count advisories at this severity or above. Default `low` (any). */
  level?: AuditLevel;
  /** Warn when at least this many unique vulnerable packages (by name). */
  warn?: number;
  /** Fail when at least this many unique vulnerable packages (by name). */
  fail?: number;
  /** Package names or advisory ids this rule skips (document why next to the entry). */
  ignore?: (string | number)[];
};

/**
 * One rule or a list of rules (each reported separately, each with its own
 * `ignore`). A rule with neither `warn` nor `fail` fails on the first
 * vulnerable package; setting only one of them disables the other.
 */
export type AuditConfig = AuditRule | AuditRule[];

type Advisory = {
  id?: number;
  module_name: string;
  severity: string;
  title: string;
  url?: string;
  vulnerable_versions?: string;
  patched_versions?: string;
  findings?: { version: string; paths: string[] }[];
};

type AuditReport = { advisories?: Record<string, Advisory> };

/** `pnpm audit --json`: exits 1 when vulnerabilities exist, stdout is still the JSON report. */
const audit = async (root: string): Promise<AuditReport | string> => {
  let stdout: string;
  try {
    ({ stdout } = await run('pnpm audit --audit-level low --json', {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    }));
  } catch (error) {
    const failed = error as {
      stdout?: string;
      stderr?: string;
      message: string;
    };
    stdout = failed.stdout ?? '';
    if (!stdout.trim().startsWith('{')) {
      return (failed.stderr || failed.message).trim();
    }
  }
  try {
    return JSON.parse(stdout) as AuditReport;
  } catch {
    return `could not parse pnpm audit output: ${stdout.slice(0, 200)}`;
  }
};

const details = (advisory: Advisory): string[] => [
  `  - ${advisory.module_name} (${advisory.severity}): ${advisory.title}`,
  `      vulnerable ${advisory.vulnerable_versions ?? '?'}; patched ${advisory.patched_versions ?? 'none'}${advisory.url ? `; ${advisory.url}` : ''}`,
  ...(advisory.findings ?? [])
    .flatMap((finding) => finding.paths)
    .slice(0, 3)
    .map((path) => `      path: ${path}`),
];

const evaluate = (
  rule: AuditRule,
  report: AuditReport | string,
  result: CheckResult,
): void => {
  const level = rule.level ?? 'low';
  const bare = rule.warn === undefined && rule.fail === undefined;
  const warn = bare ? Infinity : (rule.warn ?? Infinity);
  const fail = bare ? 1 : (rule.fail ?? Infinity);
  const limits = `warn from ${warn}, fail from ${fail}`.replaceAll(
    'Infinity',
    'never',
  );

  if (typeof report === 'string') {
    // Registry/network flakiness must not break CI: surface, do not fail.
    result.warn = true;
    result.lines.push(
      `WARN  [${level}] could not run the audit (not counted as failure)`,
      `  Cause   : ${report.split('\n')[0]}`,
      '  Fix     : rerun; if persistent run `pnpm audit` and fix the error.',
    );
    return;
  }

  const ignore = new Set(rule.ignore ?? []);
  const advisories = Object.values(report.advisories ?? {}).filter(
    (advisory) =>
      SEVERITY.indexOf(advisory.severity) >= SEVERITY.indexOf(level) &&
      !ignore.has(advisory.module_name) &&
      !(advisory.id !== undefined && ignore.has(advisory.id)),
  );
  const packages = new Set(advisories.map((advisory) => advisory.module_name));

  if (packages.size >= fail || (packages.size >= warn && packages.size > 0)) {
    const failing = packages.size >= fail;
    if (failing) result.ok = false;
    else result.warn = true;
    result.lines.push(
      `${failing ? 'FAIL' : 'WARN'}  [${level}] ${packages.size} unique vulnerable package(s) at ${level} or above (${limits})`,
      failing
        ? `  Expected: fewer than ${fail} vulnerable package(s) at "${level}" or above`
        : `  Expected: fewer than ${warn} vulnerable package(s) (warn threshold)`,
      '  Found   :',
      ...advisories.flatMap(details),
      '  Fix     : update to patched versions (`pnpm why <package>` shows the dependents), then `pnpm install`;',
      `            if it cannot apply, add the package name or advisory id to this rule's "ignore" in nitpick.config.mts with a reason.`,
    );
  } else {
    result.lines.push(
      `ok    [${level}] ${packages.size} vulnerable package(s) at ${level} or above (${limits})`,
    );
  }
};

/** Counts unique vulnerable packages per rule: warn at `warn`, fail at `fail`. */
export const auditCheck = async (
  root: string,
  config: AuditConfig,
): Promise<CheckResult> => {
  const rules = Array.isArray(config) ? config : [config];
  if (rules.length === 0) {
    throw new Error(
      [
        'audit has no rules',
        '  Expected: a rule or a non-empty list, e.g. audit: [{ level: "high", fail: 1 }, { level: "low", warn: 1 }]',
      ].join('\n'),
    );
  }

  const report = await audit(root); // one pnpm audit run, evaluated by every rule
  const result: CheckResult = { name: 'audit', ok: true, lines: [] };
  for (const rule of rules) evaluate(rule, report, result);
  return result;
};

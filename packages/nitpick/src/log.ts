import { execFileSync } from 'node:child_process';
import type { CheckResult } from './types.js';

/** Commits are compared against this ref: `origin/main..HEAD`. */
const BASE = 'origin/main';

export type LogConfig = {
  /** Check the git index as one pending commit instead (pre-commit usage). */
  staged?: boolean;
  /** Changed files that need no log entry. Replaces the defaults. */
  exempt?: RegExp[];
  /** Minimum characters of description + reason after the json block. Default 40. */
  minBodyLength?: number;
};

/** CLI override (`--staged`) takes precedence over the config. */
export type LogOptions = { staged?: boolean };

type Change = { status: string; path: string };

type Unit = {
  /** Commit label, or "staged changes". */
  label: string;
  changes: Change[];
  /** Reads a file as it is in this unit (the commit, or the index). */
  read: (path: string) => string;
  /** All tracked files as they are in this unit. */
  files: () => string[];
};

const DEFAULT_EXEMPT = [
  /(^|\/)__log__\//,
  /\.md$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /\.(png|jpe?g|webp|svg|ico)$/,
];
const LOG_FILE = /^(.*?)\/?__log__\/[^/]+\.md$/;
const TEMPLATE = '.claude/templates/task-log.md';
const NEWLINE = /\r?\n/;

const git = (root: string, args: string[]): string =>
  execFileSync('git', ['-c', 'core.quotepath=off', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const parseChanges = (output: string): Change[] =>
  output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status = '', path = ''] = line.split('\t');
      return { status, path };
    });

/** Why a log entry is invalid, or null when it is fine. */
const entryProblem = (text: string, minBody: number): string | null => {
  const afterJson = text.split(/```json[\s\S]*?```/)[1] ?? '';
  if (!/^# .+/.test(text)) return 'missing "# {id} - {summary}" header';
  if (!/```json[\s\S]*"status"[\s\S]*```/.test(text)) {
    return 'missing json block with "status"';
  }
  if (
    /(?<!\$)\{(id|summary|descriptionOfChanges|reason)\}/.test(
      text.replaceAll(/`[^`\n]*`/g, ''),
    )
  ) {
    return 'unfilled template placeholder';
  }
  if (afterJson.trim().length < minBody) {
    return `missing description of changes and reason (need at least ${minBody} characters after the json block)`;
  }
  return null;
};

/** Folders (repo-relative, '' = root) that have a `__log__` in this unit. Root always counts. */
const ownerDirs = (unit: Unit, entries: Change[]): Set<string> => {
  const dirs = new Set<string>(['']);
  for (const path of [...unit.files(), ...entries.map((e) => e.path)]) {
    const dir = LOG_FILE.exec(path)?.[1];
    if (dir !== undefined) dirs.add(dir);
  }
  return dirs;
};

/** Nearest folder at or above the file that has a `__log__` (root as fallback). */
const ownerOf = (file: string, owners: Set<string>): string => {
  let dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '';
  while (dir !== '' && !owners.has(dir)) {
    dir = dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) : '';
  }
  return dir;
};

/**
 * The commits to check: each one in `origin/main..HEAD`, or the index as one
 * unit. With nothing ahead of main (HEAD is main itself, e.g. right after a
 * push to main) the tip commit is checked instead.
 */
const units = (root: string, staged: boolean): Unit[] => {
  if (staged) {
    return [
      {
        label: 'staged changes',
        changes: parseChanges(
          git(root, ['diff', '--cached', '--name-status', '--no-renames']),
        ),
        read: (path) => git(root, ['show', `:${path}`]),
        files: () => git(root, ['ls-files']).split(NEWLINE).filter(Boolean),
      },
    ];
  }
  const list = (range: string[]): string[] =>
    git(root, ['log', '--reverse', '--no-merges', '--format=%H %s', ...range])
      .split('\n')
      .filter(Boolean);
  const ahead = list([`${BASE}..HEAD`]);
  return (ahead.length > 0 ? ahead : list(['-n', '1', 'HEAD'])).map((line) => {
    const sha = line.slice(0, line.indexOf(' '));
    return {
      label: `${sha.slice(0, 7)} ${line.slice(sha.length + 1)}`,
      changes: parseChanges(
        git(root, [
          'diff-tree',
          '--root',
          '--no-commit-id',
          '--name-status',
          '-r',
          '--no-renames',
          sha,
        ]),
      ),
      read: (path) => git(root, ['show', `${sha}:${path}`]),
      files: () =>
        git(root, ['ls-tree', '-r', '--name-only', sha])
          .split(NEWLINE)
          .filter(Boolean),
    };
  });
};

/**
 * Every commit that changes non-exempt files must add at least one valid
 * `__log__/NNNN-*.md` entry (in any `__log__` folder of the repo).
 */
export const log = (
  root: string,
  config: LogConfig,
  options: LogOptions = {},
): CheckResult => {
  const staged = options.staged ?? config.staged ?? false;
  const exempt = config.exempt ?? DEFAULT_EXEMPT;
  const minBody = config.minBodyLength ?? 40;
  const scope = staged ? 'the staged changes' : `${BASE}..HEAD`;
  const result: CheckResult = { name: 'log', ok: true, lines: [] };

  let checked: Unit[];
  try {
    checked = units(root, staged);
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr ?? String(error);
    throw new Error(
      [
        `could not read ${scope}`,
        `  Cause   : ${stderr.trim().split('\n')[0]}`,
        `  Expected: a git repository where "${BASE}" exists (CI needs full history: actions/checkout fetch-depth: 0)`,
        '  Fix     : fetch main (`git fetch origin main`).',
      ].join('\n'),
    );
  }

  let needing = 0;
  for (const unit of checked) {
    const code = unit.changes.filter(
      ({ path }) => !exempt.some((pattern) => pattern.test(path)),
    );
    if (code.length === 0) continue;
    needing += 1;

    const entries = unit.changes.filter(
      ({ status, path }) => status === 'A' && LOG_FILE.test(path),
    );
    const owners = ownerDirs(unit, entries);

    // Group changed files by their owner (nearest `__log__` folder above them).
    const byOwner = new Map<string, Change[]>();
    for (const change of code) {
      const owner = ownerOf(change.path, owners);
      byOwner.set(owner, [...(byOwner.get(owner) ?? []), change]);
    }

    for (const [owner, changes] of byOwner) {
      const logDir = owner === '' ? '__log__' : `${owner}/__log__`;
      const added = entries.filter(
        ({ path }) => LOG_FILE.exec(path)?.[1] === owner,
      );
      if (added.length === 0) {
        result.ok = false;
        result.lines.push(
          `FAIL  ${unit.label}`,
          `  Problem : changes owned by ${logDir}/ but this commit adds no entry there`,
          `  Expected: at least one NEW ${logDir}/NNNN-*.md file in the same commit (the nearest __log__ folder above the changed files; one decision = one commit)`,
          `  Found   : ${changes.length} changed file(s), 0 added entries in ${logDir}/:`,
          ...changes
            .slice(0, 10)
            .map(({ status, path }) => `    ${status} ${path}`),
          ...(changes.length > 10
            ? [`    ... ${changes.length - 10} more`]
            : []),
          `  Fix     : add ${logDir}/NNNN-<slug>.md (next free number, template: ${TEMPLATE}) to this commit describing the change and why;`,
          '            to exempt a file kind add a pattern to log.exempt in nitpick.config.mts.',
        );
        continue;
      }
      for (const { path } of added) {
        const problem = entryProblem(unit.read(path), minBody);
        if (problem) {
          result.ok = false;
          result.lines.push(
            `FAIL  ${unit.label}`,
            `  Problem : invalid log entry ${path}: ${problem}`,
            `  Expected: "# {id} - {summary}" header, a json block with "status", then description and reason (template: ${TEMPLATE})`,
            '  Fix     : edit the entry so it follows the template.',
          );
        }
      }
    }
  }

  if (result.ok) {
    result.lines.push(
      `ok    ${needing} of ${checked.length} commit(s) in ${scope} change code; each has a valid new entry in every owning __log__ folder`,
    );
  }
  return result;
};

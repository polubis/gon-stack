import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { CheckResult } from './types.js';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export type HashTarget = {
  /** Exact repo-relative path (file or directory). */
  path?: string;
  /** Regex on repo-relative directory paths; every hit becomes a target. */
  match?: RegExp;
  /** Doc storing the hash, relative to the target's directory. Default AGENTS.md. */
  doc?: string;
  include?: RegExp[];
  exclude?: RegExp[];
};

export type HashConfig = {
  include?: RegExp[];
  exclude?: RegExp[];
  targets: HashTarget[];
};

type ResolvedTarget = {
  rel: string;
  abs: string;
  isFile: boolean;
  docAbs: string;
  include: RegExp[];
  exclude: RegExp[];
};

const DEFAULT_INCLUDE = [/\.(tsx?|jsx?|css|scss)$/];
const DEFAULT_EXCLUDE = [
  /(^|\/)(node_modules|dist|\.git|\.turbo|__snapshots__)(\/|$)/,
  /\.(test|spec)\.[jt]sx?$/,
];
const WALK_SKIP = /(^|\/)(node_modules|dist|\.git|\.turbo|\.worktrees)(\/|$)/;

const posix = (path: string): string => path.split(sep).join('/');

const listDirs = (root: string): string[] => {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = join(dir, entry.name);
      const rel = posix(relative(root, full));
      if (WALK_SKIP.test(rel)) continue;
      out.push(rel);
      walk(full);
    }
  };
  walk(root);
  return out;
};

const resolveTargets = (root: string, config: HashConfig): ResolvedTarget[] => {
  const seen = new Set<string>();
  const out: ResolvedTarget[] = [];
  const dirs = config.targets.some((t) => t.match) ? listDirs(root) : [];

  for (const target of config.targets) {
    const { path, match } = target;
    if (!path && !match) {
      throw new Error(
        [
          `hash target needs \`path\` or \`match\`, got: ${JSON.stringify(target)}`,
          '  Fix: set { path: "apps/x/src/module" } or { match: /regex/ } in nitpick.config.mts.',
        ].join('\n'),
      );
    }
    const paths = path ? [path] : dirs.filter((dir) => match?.test(dir));

    for (const rel of paths) {
      const abs = resolve(root, rel);
      if (!existsSync(abs)) {
        throw new Error(
          [
            `hash target not found: ${rel} (resolved to ${abs})`,
            `  Paths are relative to the repo root ${root}.`,
            '  Fix: correct the path or remove the target from nitpick.config.mts.',
          ].join('\n'),
        );
      }
      if (seen.has(rel)) continue;
      seen.add(rel);
      const isFile = !statSync(abs).isDirectory();
      out.push({
        rel,
        abs,
        isFile,
        docAbs: join(isFile ? dirname(abs) : abs, target.doc ?? 'AGENTS.md'),
        include: target.include ?? config.include ?? DEFAULT_INCLUDE,
        exclude: target.exclude ?? config.exclude ?? DEFAULT_EXCLUDE,
      });
    }
  }
  return out;
};

/** Files (relative to the target dir, sorted) that feed the hash. */
const collectFiles = (target: ResolvedTarget): string[] => {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const rel = posix(relative(target.abs, full));
      if (target.exclude.some((re) => re.test(rel))) continue;
      if (entry.isDirectory()) walk(full);
      else if (target.include.some((re) => re.test(rel))) out.push(rel);
    }
  };
  walk(target.abs);
  return out.sort();
};

/** Ignore formatter-only edits: drop trailing commas and all whitespace. */
const normalise = (src: string): string =>
  src.replace(/,(\s*[}\])])/g, '$1').replace(/\s/g, '');

const computeHash = (
  target: ResolvedTarget,
): { hash: string; count: number } => {
  const files = target.isFile ? [target.abs] : collectFiles(target);
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(target.isFile ? posix(target.rel) : file);
    hash.update('\0');
    hash.update(
      normalise(
        readFileSync(target.isFile ? file : join(target.abs, file), 'utf8'),
      ),
    );
    hash.update('\0');
  }
  return { hash: hash.digest('hex'), count: files.length };
};

const readStoredHash = (docAbs: string): string | undefined => {
  if (!existsSync(docAbs)) return undefined;
  const match = FRONTMATTER_RE.exec(readFileSync(docAbs, 'utf8'));
  return /^hash:\s*(\S+)\s*$/m.exec(match?.[1] ?? '')?.[1];
};

/** Set `hash:` in place: only that value changes; EOLs and body stay untouched. */
const writeStoredHash = (docAbs: string, hash: string): void => {
  const md = existsSync(docAbs) ? readFileSync(docAbs, 'utf8') : '';
  const eol = md.includes('\r\n') ? '\r\n' : '\n';
  const match = FRONTMATTER_RE.exec(md);

  let next: string;
  if (!match) {
    next = `---${eol}hash: ${hash}${eol}---${eol}${eol}${md}`;
  } else if (/^hash:/m.test(match[1] ?? '')) {
    next = md.replace(/^hash:.*$/m, `hash: ${hash}`);
  } else {
    next = md.replace(/^---\r?\n/, `---${eol}hash: ${hash}${eol}`);
  }
  if (next !== md) writeFileSync(docAbs, next);
};

const git = (root: string, args: string[]): string | undefined => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : undefined;
};

/**
 * Hash-relevant files changed since the commit that last touched the doc's
 * `hash:` line (committed, uncommitted and untracked). Undefined without git history.
 */
const changedSinceStamp = (
  root: string,
  target: ResolvedTarget,
): { sha: string; changes: string[] } | undefined => {
  const docRel = posix(relative(root, target.docAbs));
  const scope = posix(relative(root, target.abs));
  const sha = git(root, [
    'log',
    '-n1',
    '--format=%H',
    '-G',
    '^hash:',
    '--',
    docRel,
  ]);
  if (!sha) return undefined;

  const rows = (git(root, ['diff', '--name-status', sha, '--', scope]) ?? '')
    .split('\n')
    .filter(Boolean)
    .map((row) => row.split('\t'));
  const untracked = (
    git(root, ['ls-files', '--others', '--exclude-standard', '--', scope]) ?? ''
  )
    .split('\n')
    .filter(Boolean)
    .map((file) => ['A', file]);

  const changes = [...rows, ...untracked]
    .map(([status = '?', ...files]) => ({
      status: status.charAt(0),
      file: files.join(' -> '),
      current: files[files.length - 1] ?? '',
    }))
    .filter(({ current }) => {
      if (current === docRel) return false;
      if (target.isFile) return true;
      const inside = current.slice(scope.length + 1);
      return (
        !target.exclude.some((re) => re.test(inside)) &&
        target.include.some((re) => re.test(inside))
      );
    })
    .map(({ status, file }) => `${status} ${file}`);
  return { sha, changes };
};

const short = (value: string): string => `${value.slice(0, 12)}...`;

const failure = (
  root: string,
  target: ResolvedTarget,
  current: string,
  count: number,
  stored: string | undefined,
): string[] => {
  const doc = posix(relative(root, target.docAbs));
  const stamp = `nitpick hash ${target.rel} --write`;
  const head = `FAIL  ${target.rel}`;

  if (!existsSync(target.docAbs)) {
    return [
      head,
      `  Problem : doc file does not exist: ${doc}`,
      `  Expected: ${doc} with frontmatter "hash: <sha256>" describing ${target.rel}`,
      `  Fix     : create ${doc} (skill \`document-module\`), then run \`${stamp}\``,
    ];
  }
  if (!stored) {
    return [
      head,
      `  Problem : ${doc} has no "hash:" line in its frontmatter`,
      `  Expected: frontmatter "hash: ${short(current)}" (sha256 over ${count} files)`,
      `  Fix     : verify ${doc} matches the current code, then run \`${stamp}\``,
    ];
  }

  const since = changedSinceStamp(root, target);
  return [
    head,
    `  Problem : ${target.rel} changed after ${doc} was last stamped (doc may be stale)`,
    `  Expected: "hash: ${short(current)}" (sha256 over ${count} files)`,
    `  Found   : "hash: ${short(stored)}" in ${doc}`,
    ...(since
      ? [
          since.changes.length > 0
            ? `  Changed since last stamp (${since.sha.slice(0, 7)}), M=modified A=added D=deleted R=renamed:`
            : `  No hashed file differs from stamp commit ${since.sha.slice(0, 7)} in git: the hash changed by content only (or the stamp came from an older algorithm/config).`,
          ...since.changes.map((change) => `    ${change}`),
        ]
      : ['  Changed files: unknown (no git history for the doc)']),
    `  Fix     : 1) read the changed files and update ${doc} so it matches the code`,
    `            (skill \`hasher\`); 2) run \`${stamp}\`; 3) rerun \`nitpick hash\`.`,
    `  Note    : whitespace and trailing commas never change the hash.`,
  ];
};

/** Check (or stamp with `write`) hash targets. */
export const hash = (
  root: string,
  config: HashConfig,
  filters: string[] = [],
  write = false,
): CheckResult => {
  const wanted = filters.map((f) => posix(relative(root, resolve(f))));
  const all = resolveTargets(root, config);
  const targets = all.filter(
    (t) =>
      wanted.length === 0 ||
      wanted.some((w) => t.rel === w || t.rel.startsWith(`${w}/`)),
  );
  if (targets.length === 0) {
    throw new Error(
      [
        `no hash target matches ${JSON.stringify(filters)}.`,
        `  Configured targets (nitpick.config.mts -> hash.targets): ${all.map((t) => t.rel).join(', ') || 'none'}`,
        '  Fix: pass a path equal to / inside a configured target, or add the target to the config.',
      ].join('\n'),
    );
  }

  const result: CheckResult = { name: 'hash', ok: true, lines: [] };
  for (const target of targets) {
    const { hash: current, count } = computeHash(target);
    if (count === 0) {
      throw new Error(
        [
          `no files matched under hash target: ${target.rel}`,
          `  include: ${target.include.join(', ')}`,
          `  exclude: ${target.exclude.join(', ')}`,
          '  Expected: at least one file included and not excluded.',
          '  Fix: correct the target path or its include/exclude in nitpick.config.mts.',
        ].join('\n'),
      );
    }
    const doc = posix(relative(root, target.docAbs));
    const stored = readStoredHash(target.docAbs);

    if (write) {
      writeStoredHash(target.docAbs, current);
      result.lines.push(`stamped ${doc} (${count} files)`);
    } else if (stored === current) {
      result.lines.push(`ok    ${target.rel}`);
    } else {
      result.ok = false;
      result.lines.push(...failure(root, target, current, count, stored));
    }
  }
  return result;
};

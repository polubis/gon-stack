import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Directory / file names never included in a module content hash. */
const IGNORED = new Set([
  'node_modules',
  'dist',
  '.git',
  '.turbo',
  '__snapshots__',
]);

/** File extensions included in the module content hash. */
const ALLOWED_EXTENSIONS = new Set(['js', 'jsx', 'ts', 'tsx', 'css', 'scss']);

export type Frontmatter = {
  version: string;
  hash: string;
};

export type HashResult = {
  /** Absolute path of the markdown file the frontmatter belongs to. */
  mdPath: string;
  /** Stable content hash of the scanned implementation files. */
  hash: string;
  /** Files (relative, posix) that fed the hash, in deterministic order. */
  files: string[];
};

/**
 * Collect every implementation file under `dir`, deterministically sorted.
 * Only files with whitelisted extensions are included; known noise directories
 * and the target markdown file are skipped.
 */
export const collectFiles = (dir: string, skipMd: string): string[] => {
  const out: string[] = [];

  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (full === skipMd) continue;
      const ext = entry.name.split('.').pop();
      if (!ext || !ALLOWED_EXTENSIONS.has(ext)) continue;
      out.push(relative(dir, full).split(sep).join('/'));
    }
  };

  walk(dir);
  return out.sort();
};

/** Compute a stable sha256 over the sorted file set (path + content). */
export const computeHash = (dir: string, files: string[]): string => {
  const hash = createHash('sha256');
  for (const rel of files) {
    hash.update(rel);
    hash.update('\0');
    hash.update(readFileSync(join(dir, rel)));
    hash.update('\0');
  }
  return hash.digest('hex');
};

/** Hash the implementation files in `dir`, describing the doc at `dir/mdName`. */
export const hashModule = (dir: string, mdName: string): HashResult => {
  const mdPath = join(dir, mdName);
  const files = collectFiles(dir, mdPath);
  return { mdPath, hash: computeHash(dir, files), files };
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Read `version`/`hash` from a markdown string's frontmatter, if present. */
export const readFrontmatter = (md: string): Partial<Frontmatter> => {
  const match = FRONTMATTER_RE.exec(md);
  if (!match) return {};
  const block = match[1] ?? '';
  const result: Partial<Frontmatter> = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = /^(version|hash):\s*(.+?)\s*$/.exec(line);
    if (kv && kv[1] && kv[2]) {
      if (kv[1] === 'version') result.version = kv[2];
      else result.hash = kv[2];
    }
  }
  return result;
};

/** Bump the minor segment of an `X.Y` version; default first version is `1.0`. */
export const bumpVersion = (current: string | undefined): string => {
  if (!current) return '1.0';
  const parts = current.split('.');
  const major = Number(parts[0]);
  const minor = Number(parts[1] ?? '0');
  if (Number.isNaN(major) || Number.isNaN(minor)) return '1.0';
  return `${major}.${minor + 1}`;
};

/**
 * Return `md` with its frontmatter `version`/`hash` updated to `next`.
 * Preserves any other frontmatter keys and the document body.
 */
export const writeFrontmatter = (md: string, next: Frontmatter): string => {
  const match = FRONTMATTER_RE.exec(md);
  const stamped = `version: ${next.version}\nhash: ${next.hash}`;

  if (!match) {
    return `---\n${stamped}\n---\n\n${md}`;
  }

  const others = (match[1] ?? '')
    .split(/\r?\n/)
    .filter((line) => !/^(version|hash):/.test(line) && line.trim() !== '')
    .join('\n');

  const body = md.slice(match[0].length);
  const block = others ? `${stamped}\n${others}` : stamped;
  return `---\n${block}\n---\n\n${body}`;
};

export const isDir = (path: string): boolean => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

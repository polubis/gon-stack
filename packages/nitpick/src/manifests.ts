import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { CheckResult } from './types.js';

export type ManifestsConfig = {
  /** Package names allowed to share a name with another workspace package. */
  ignore?: string[];
};

/** package.json files of the root and of every `pnpm-workspace.yaml` `dir/*` glob. */
const workspaceManifests = (root: string): string[] => {
  const workspaceFile = join(root, 'pnpm-workspace.yaml');
  if (!existsSync(workspaceFile)) {
    throw new Error(
      `pnpm-workspace.yaml not found in ${root}\n  Expected: a pnpm workspace root listing packages as "- dir/*".`,
    );
  }
  const globs = [
    ...readFileSync(workspaceFile, 'utf8').matchAll(
      /^\s*-\s*['"]?([\w.-]+)\/\*['"]?\s*$/gm,
    ),
  ].map((m) => m[1] as string);

  const out = [join(root, 'package.json')];
  for (const dir of globs) {
    if (!existsSync(join(root, dir))) continue;
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const file = join(root, dir, entry.name, 'package.json');
      if (entry.isDirectory() && existsSync(file)) out.push(file);
    }
  }
  return out;
};

/** Every workspace package.json must be valid JSON with a unique, non-empty `name`. */
export const manifests = (
  root: string,
  config: ManifestsConfig,
): CheckResult => {
  const ignore = new Set(config.ignore ?? []);
  const owners = new Map<string, string[]>(); // name -> package.json files
  const result: CheckResult = { name: 'manifests', ok: true, lines: [] };
  let count = 0;

  for (const file of workspaceManifests(root)) {
    const rel = relative(root, file).split(sep).join('/');
    count += 1;
    let name: unknown;
    try {
      name = (JSON.parse(readFileSync(file, 'utf8')) as { name?: unknown })
        .name;
    } catch (error) {
      result.ok = false;
      result.lines.push(
        `FAIL  ${rel}`,
        `  Problem : invalid JSON (${error instanceof Error ? error.message : String(error)})`,
        '  Expected: a valid package.json',
        '  Fix     : correct the JSON syntax in the file above.',
      );
      continue;
    }
    if (typeof name !== 'string' || name.trim() === '') {
      result.ok = false;
      result.lines.push(
        `FAIL  ${rel}`,
        '  Problem : missing or empty "name"',
        '  Expected: a non-empty string "name" (pnpm workspaces identify packages by it)',
        '  Fix     : add a unique "name" to the file above.',
      );
      continue;
    }
    owners.set(name, [...(owners.get(name) ?? []), rel]);
  }

  for (const [name, files] of owners) {
    if (files.length < 2 || ignore.has(name)) continue;
    result.ok = false;
    result.lines.push(
      `FAIL  ${name}`,
      `  Problem : ${files.length} workspace packages share this name`,
      '  Expected: every workspace package has a unique "name"',
      '  Found   :',
      ...files.map((file) => `    - ${file}`),
      '  Fix     : rename all but one (update dependents and `--filter` usages),',
      `            or add "${name}" to manifests.ignore in nitpick.config.mts.`,
    );
  }

  if (result.ok)
    result.lines.push(`ok    ${count} package.json files valid, names unique`);
  return result;
};

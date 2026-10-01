#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { auditCheck } from './audit.js';
import { hash } from './hash.js';
import type { Config } from './index.js';
import type { CheckResult } from './types.js';
import { log } from './log.js';
import { manifests } from './manifests.js';
import { outdated } from './outdated.js';

const CONFIG_FILE = 'nitpick.config.mts';

const USAGE = `nitpick — shared CI/CD checks, configured in ${CONFIG_FILE} (repo root)

Usage:
  nitpick [check...] [path...] [--write]

Checks (no check given = every check present in the config, in parallel):
  hash      Detect real code changes vs. the last accepted state of each
            target (dir or file). Its doc (default AGENTS.md next to it)
            stores the accepted \`hash:\`.
  manifests Every workspace package.json is valid and has a unique "name".
  outdated  Unique outdated package names per rule (minor/major/patch...): warn/fail thresholds.
  audit     Known vulnerabilities (pnpm audit) at or above a severity level.
  log       Each commit (vs origin/main, or the tip commit on main) adds a valid "__log__" entry in every owning folder.

Flags:
  --write        hash only: stamp current hash into the doc.
  [path...]      hash only: limit to targets equal to / under these paths.
  --staged       log only: check the git index as one pending commit.
  -h, --help     Show this help.`;

const CHECKS = ['hash', 'manifests', 'outdated', 'audit', 'log'] as const;
type CheckName = (typeof CHECKS)[number];

const isCheck = (arg: string | undefined): arg is CheckName =>
  CHECKS.some((name) => name === arg);

const findRoot = (from: string): string => {
  let dir = from;
  while (!existsSync(join(dir, CONFIG_FILE))) {
    const parent = dirname(dir);
    if (parent === dir)
      throw new Error(`${CONFIG_FILE} not found above ${from}`);
    dir = parent;
  }
  return dir;
};

const missing = (name: CheckName, example: string): Error =>
  new Error(
    [
      `check "${name}" requested but not configured in ${CONFIG_FILE}`,
      `  Expected: a top-level \`${name}\` key in defineConfig(...)`,
      `  Example : export default defineConfig({ ${example} });`,
    ].join('\n'),
  );

const loadConfig = async (root: string): Promise<Config> => {
  const file = join(root, CONFIG_FILE);
  let loaded: { default?: Config };
  try {
    loaded = (await import(pathToFileURL(file).href)) as { default?: Config };
  } catch (error) {
    throw new Error(
      [
        `failed to load ${file}`,
        `  Cause   : ${error instanceof Error ? error.message : String(error)}`,
        '  Expected: valid TypeScript (erasable syntax only) importing defineConfig from "@repo/nitpick"',
        '  Fix     : run `pnpm --filter @repo/nitpick build` (config imports the built package) and fix the error above.',
      ].join('\n'),
    );
  }
  if (!loaded.default) {
    throw new Error(
      [
        `${CONFIG_FILE} has no default export`,
        '  Expected: export default defineConfig({ ... })',
      ].join('\n'),
    );
  }
  return loaded.default;
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }

  const positional = argv.filter((arg) => !arg.startsWith('-'));
  const requested = positional.filter(isCheck);
  const paths = positional.filter((arg) => !isCheck(arg));
  const write = argv.includes('--write');
  const staged = argv.includes('--staged') ? true : undefined;

  const root = findRoot(process.cwd());
  const config = await loadConfig(root);

  const selected =
    requested.length > 0 ? requested : CHECKS.filter((name) => config[name]);
  if (selected.length === 0) {
    throw new Error(
      [
        `no checks configured in ${CONFIG_FILE}`,
        `  Expected: at least one top-level key of: ${CHECKS.join(', ')}`,
        `  Example : export default defineConfig({ manifests: {} });`,
      ].join('\n'),
    );
  }

  const run = (name: CheckName): CheckResult | Promise<CheckResult> => {
    switch (name) {
      case 'hash':
        if (!config.hash)
          throw missing(
            name,
            'hash: { targets: [{ path: "apps/x/src/module" }] }',
          );
        return hash(root, config.hash, paths, write);
      case 'manifests':
        if (!config.manifests) throw missing(name, 'manifests: {}');
        return manifests(root, config.manifests);
      case 'log':
        if (!config.log) throw missing(name, 'log: {}');
        return log(root, config.log, { staged });
      case 'audit':
        if (!config.audit) throw missing(name, 'audit: {}');
        return auditCheck(root, config.audit);
      case 'outdated':
        if (!config.outdated) throw missing(name, 'outdated: {}');
        return outdated(root, config.outdated);
    }
  };

  // One check crashing (bad config, missing file) must not hide the others.
  const results = await Promise.all(
    selected.map(async (name): Promise<CheckResult> => {
      try {
        return await run(name);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { name, ok: false, lines: ['ERROR', ...message.split('\n')] };
      }
    }),
  );

  for (const { name, ok, warn, lines } of results) {
    const stream = ok ? process.stdout : process.stderr;
    for (const line of lines) stream.write(`nitpick ${name}: ${line}\n`);
    // Surface warnings as GitHub annotations without failing the run.
    if (warn && process.env.CI) {
      const title = lines[0] ?? `${name} warning`;
      process.stdout.write(`::warning title=nitpick ${name}::${title}\n`);
    }
  }
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    throw new Error(
      `${failed.length}/${results.length} check(s) failed: ${failed.map((r) => r.name).join(', ')}. ` +
        `Details above; each FAIL block lists Problem / Expected / Found / Fix.`,
    );
  }
};

main().catch((error: unknown) => {
  process.stderr.write(
    `nitpick: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});

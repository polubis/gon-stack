#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  bumpVersion,
  hashModule,
  isDir,
  readFrontmatter,
  writeFrontmatter,
} from './index.js';

const USAGE = `hashy — version + hash markdown against the code it documents

Usage:
  hashy <module-dir> <markdown-file> [--check]
  hashy --manifest <file>            verify every entry in a manifest (check mode)

Args:
  <module-dir>     Directory whose implementation files are hashed.
  <markdown-file>  Markdown file (inside <module-dir>) to stamp/verify.

Flags:
  --check              Verify only. Exit 1 on drift or missing hash. No writes.
  --manifest <file>    Run --check for each "<dir> <doc>" line (\`#\` = comment).
  -h, --help           Show this help.`;

const fail = (message: string): never => {
  process.stderr.write(`hashy: ${message}\n`);
  process.exit(1);
};

type CheckOutcome = { ok: boolean; message: string };

const checkModule = (dirArg: string, mdArg: string): CheckOutcome => {
  const dir = resolve(dirArg);
  if (!isDir(dir)) return { ok: false, message: `not a directory: ${dir}` };

  const { mdPath, hash, files } = hashModule(dir, mdArg);
  if (files.length === 0) {
    return { ok: false, message: `no implementation files under: ${dir}` };
  }
  if (!existsSync(mdPath))
    return { ok: false, message: `missing doc: ${mdPath}` };

  const current = readFrontmatter(readFileSync(mdPath, 'utf8'));
  if (!current.hash) {
    return { ok: false, message: `no hash in frontmatter: ${mdPath}` };
  }
  if (current.hash !== hash) {
    return {
      ok: false,
      message: `hash drift in ${mdPath}\n  stored:   ${current.hash}\n  computed: ${hash}\n  run \`hashy ${dirArg} ${mdArg}\` to update.`,
    };
  }
  return {
    ok: true,
    message: `ok — ${mdPath} matches (${files.length} files)`,
  };
};

const stampModule = (dirArg: string, mdArg: string): void => {
  const dir = resolve(dirArg);
  if (!isDir(dir)) fail(`not a directory: ${dir}`);

  const { mdPath, hash, files } = hashModule(dir, mdArg);
  if (files.length === 0) fail(`no implementation files found under: ${dir}`);

  const md = existsSync(mdPath) ? readFileSync(mdPath, 'utf8') : '';
  const current = readFrontmatter(md);
  const version =
    current.hash === hash && current.version
      ? current.version
      : bumpVersion(current.version);

  writeFileSync(mdPath, writeFrontmatter(md, { version, hash }));
  process.stdout.write(
    `hashy: stamped ${mdPath}\n  version: ${version}\n  hash:    ${hash}\n  files:   ${files.length}\n`,
  );
};

const runManifest = (manifestArg: string): void => {
  const manifestPath = resolve(manifestArg);
  if (!existsSync(manifestPath)) fail(`manifest not found: ${manifestPath}`);

  const base = dirname(manifestPath);
  const entries = readFileSync(manifestPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/));

  if (entries.length === 0) fail(`manifest is empty: ${manifestPath}`);

  let failures = 0;
  for (const [dir, doc = 'AGENTS.md'] of entries) {
    const outcome = checkModule(resolve(base, dir as string), doc);
    process.stdout.write(
      `hashy: ${outcome.ok ? 'ok  ' : 'FAIL'} ${dir} ${doc}\n`,
    );
    if (!outcome.ok) {
      failures += 1;
      process.stderr.write(`  ${outcome.message}\n`);
    }
  }

  if (failures > 0) fail(`${failures} doc(s) out of sync.`);
  process.stdout.write(`hashy: all ${entries.length} doc(s) in sync.\n`);
};

const main = (): void => {
  const argv = process.argv.slice(2);

  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }

  const manifestIdx = argv.indexOf('--manifest');
  if (manifestIdx !== -1) {
    const manifest = argv[manifestIdx + 1];
    if (!manifest) fail(`--manifest requires a file path.\n\n${USAGE}`);
    runManifest(manifest as string);
    return;
  }

  const check = argv.includes('--check');
  const positional = argv.filter((a) => !a.startsWith('-'));
  const [dirArg, mdArg] = positional;
  if (!dirArg || !mdArg) fail(`missing arguments.\n\n${USAGE}`);

  const dir = dirArg as string;
  const md = mdArg as string;

  if (check) {
    const outcome = checkModule(dir, md);
    if (!outcome.ok) fail(outcome.message);
    process.stdout.write(`hashy: ${outcome.message}\n`);
    return;
  }

  stampModule(dir, md);
};

main();

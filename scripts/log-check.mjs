// Fails when changed code has no decision-log entry in a covering `__log__` dir.
// Usage: node scripts/log-check.mjs --staged | --base <ref>
import { execFileSync } from 'node:child_process';

const EXEMPT = [
  /(^|\/)__log__\//,
  /\.md$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /\.(png|jpe?g|webp|svg|ico)$/,
];
const LOG_FILE = /^(.*?)\/?__log__\/[^/]+\.md$/;
const MIN_BODY_LENGTH = 40;

const git = (...args) =>
  execFileSync('git', ['-c', 'core.quotepath=off', ...args], {
    encoding: 'utf8',
  });

const args = process.argv.slice(2);
const staged = args.includes('--staged');
const base = args[args.indexOf('--base') + 1] ?? 'origin/main';

const changed = git(
  'diff',
  '--name-status',
  '--no-renames',
  ...(staged ? ['--cached'] : [`${base}...HEAD`]),
)
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [status, path] = line.split('\t');
    return { status, path };
  });

const readLog = (path) => git('show', `${staged ? '' : 'HEAD'}:${path}`);

const logs = changed.filter(
  ({ status, path }) => status !== 'D' && LOG_FILE.test(path),
);

const logProblem = (path) => {
  const text = readLog(path);
  const afterJson = text.split(/```json[\s\S]*?```/)[1] ?? '';
  if (!/^# .+/.test(text)) return 'missing "# {id} - {summary}" header';
  if (!/```json[\s\S]*"status"[\s\S]*```/.test(text))
    return 'missing json block with "status"';
  if (
    /(?<!\$)\{(id|summary|descriptionOfChanges|reason)\}/.test(
      text.replace(/`[^`\n]*`/g, ''),
    )
  )
    return 'unfilled template placeholder';
  if (afterJson.trim().length < MIN_BODY_LENGTH)
    return 'missing description of changes and reason';
  return null;
};

const problems = [];

for (const { path } of logs) {
  const problem = logProblem(path);
  if (problem) problems.push(`${path}: ${problem}`);
}

const covers = (logPath, file) => {
  const root = logPath.match(LOG_FILE)[1];
  return root === '' || file.startsWith(`${root}/`);
};

for (const { path } of changed) {
  if (EXEMPT.some((pattern) => pattern.test(path))) continue;
  if (!logs.some(({ path: logPath }) => covers(logPath, path)))
    problems.push(`${path}: no changed __log__ entry covers this file`);
}

if (problems.length > 0) {
  console.error(
    `log:check failed. Add or update a __log__/NNNN-*.md entry (see .claude/templates/task-log.md):\n${problems
      .map((problem) => `  - ${problem}`)
      .join('\n')}`,
  );
  process.exit(1);
}

console.log('log:check ok');

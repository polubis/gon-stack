import { fileURLToPath } from 'node:url';
import type { Rule } from '../config.js';

const COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];
const BODY_LINE = /^(- \S|\s+\S|[A-Za-z][A-Za-z-]*: \S)/;

const validateRichCommit = (
  message: string,
  { types }: { types: string[] },
): string[] => {
  const subjectPattern = new RegExp(
    String.raw`^(${types.join('|')})\([^()\s]+\)!?: \S.*$`,
  );
  const [subject = '', blank, ...body] = message
    .replaceAll('\r\n', '\n')
    .trimEnd()
    .split('\n');
  const problems: string[] = [];

  if (!subjectPattern.test(subject)) {
    problems.push(`Subject must be "type(scope)!: title", found "${subject}"`);
  }
  if (blank === undefined) {
    problems.push('Body with a "- " change list is required');
    return problems;
  }
  if (blank !== '') problems.push('Blank line required after subject');
  if (!body.some((line) => line.startsWith('- '))) {
    problems.push('Body must contain a "- " change list');
  }
  for (const line of body) {
    if (line !== '' && !BODY_LINE.test(line)) {
      problems.push(
        `Body line must be bullet, indented or "Key: value" trailer, found "${line}"`,
      );
    }
  }

  return problems;
};

export const richCommit: Rule<never> = {
  id: 'rich-commit',
  group: 'git',
  instruction: {
    file: fileURLToPath(new URL('rich-commit.md', import.meta.url)),
  },
  check: ({ git, report }) => {
    for (const message of git.commitMessages)
      for (const problem of validateRichCommit(message, {
        types: COMMIT_TYPES,
      }))
        report(problem);
  },
};

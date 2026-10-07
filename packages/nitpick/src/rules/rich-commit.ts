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
const BULLET = /^\s*- \S/;
const FOOTER =
  /^(\s*- )?\s*(co-authored-by|signed-off-by|reviewed-by|acked-by|refs?|fixes|closes|resolves|breaking[ -]change|generated (with|by))\b|🤖/i;
const FIX = `Rewrite the commit message as "type(scope): title", a blank line, then a "- " change list (nested "  - " items allowed). Nothing may follow the list: no footer, trailer, reference or credit. Example:
fix(repo): prevent racing of requests

- Introduce a request id and a reference to latest request
  - Nested detail`;

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
    if (FOOTER.test(line)) {
      problems.push(
        `Footer, trailer, reference or credit not allowed, found "${line}"`,
      );
    } else if (line === '') {
      problems.push('Blank line not allowed inside the change list');
    } else if (!BULLET.test(line)) {
      problems.push(
        `Only "- " list items are allowed after the subject, found "${line}"`,
      );
    }
  }

  return problems;
};

export const richCommit: Rule<never> = {
  id: 'rich-commit',
  group: 'git',
  fix: FIX,
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

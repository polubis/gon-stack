import { fileURLToPath } from 'node:url';
import type { RuleUnit } from '../config.js';

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
const SESSION_TRAILER =
  /^Claude-Session: https:\/\/claude\.ai\/code\/session_[\w-]+$/;
const FIX = `Rewrite the commit message as "type(scope): title", a blank line, then a "- " change list (nested "  - " items allowed). Nothing may follow the list except an optional final "Claude-Session: https://claude.ai/code/session_<id>" line (after a blank line); no other footer, trailer, reference or credit. Example:
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
  const lines = message.replaceAll('\r\n', '\n').trimEnd().split('\n');
  if (SESSION_TRAILER.test(lines.at(-1) as string)) {
    lines.pop();
    if (lines.at(-1) === '') lines.pop();
  }
  const [subject = '', blank, ...body] = lines;
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

export const richCommit: RuleUnit = {
  importance: 'A',
  fix: FIX,
  doc: {
    file: fileURLToPath(new URL('rich-commit.md', import.meta.url)),
  },
  run: ({ git, report }) => {
    for (const message of git.commitMessages)
      for (const problem of validateRichCommit(message, {
        types: COMMIT_TYPES,
      }))
        report(problem);
  },
};

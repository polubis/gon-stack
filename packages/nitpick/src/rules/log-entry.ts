import { fileURLToPath } from 'node:url';
import type { Rule } from '../config.js';

const LOG_FILE = /(^|\/)__log__\/(\d{4,})-[a-z0-9][a-z0-9-]*\.md$/;
const HEADING = /^# (\d{4,}) - \S/;
const STATUS = /"status":\s*"(done|failed|done-with-clarification)"/;
const FIX = `Add a new file "__log__/NNNN-slug.md" (next free number) to the commit and stage it. Content:
# NNNN - summary

\`\`\`json
{ "status": "done" }
\`\`\`

Description of changes.

Reason.`;

const validateLogEntry = (file: string, text: string): string[] => {
  const number = LOG_FILE.exec(file)?.[2];
  const heading = HEADING.exec(text);
  const problems: string[] = [];

  if (heading?.[1] !== number) {
    problems.push(`${file}: first line must be "# ${number} - <summary>"`);
  }
  if (!STATUS.test(text)) {
    problems.push(
      `${file}: json block with "status": "done" | "failed" | "done-with-clarification" is required`,
    );
  }

  return problems;
};

export const logEntry: Rule<never> = {
  id: 'log-entry',
  group: 'general',
  fix: FIX,
  instruction: {
    file: fileURLToPath(new URL('log-entry.md', import.meta.url)),
  },
  check: async ({ git, readText, report }) => {
    const entries = git.stagedAddedFiles.filter((file) => LOG_FILE.test(file));
    if (entries.length === 0) {
      report('No new "__log__/NNNN-slug.md" entry staged in this commit');
    }
    for (const file of entries)
      for (const problem of validateLogEntry(file, await readText(file)))
        report(problem);
  },
};

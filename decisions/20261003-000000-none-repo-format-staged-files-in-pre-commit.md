---
ticket: none
scope: repo
summary: Lint-staged formats staged files only in pre-commit
why: The function form of lint-staged appends no file args, so every commit formatted ~1000 tracked files
date: 2026-10-03
---

- `lint-staged.config.mjs`: dropped the function task that ran `prettier --write` on the whole `**/*.{ts,tsx,json,yaml,css,js,jsx}` glob.
- Pre-commit now uses the string form so lint-staged passes only staged paths to Prettier and re-stages them after format.
- Prettier touched EOF/CRLF on many paths; combined with lint-staged’s backup/restore, commits often finished with spurious unstaged `\ No newline at end of file` (or similar) diffs.
- Repo-wide format stays `pnpm format`; CI still uses `//#format:check`.

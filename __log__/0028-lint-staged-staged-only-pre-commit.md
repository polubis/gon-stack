# 0028 - lint-staged formats staged files only in pre-commit

```json
{
  "status": "done"
}
```

`lint-staged.config.mjs`: dropped the function task that ran `prettier --write` on the whole `**/*.{ts,tsx,json,yaml,css,js,jsx}` glob. Pre-commit now uses the string form so lint-staged passes only staged paths to Prettier and re-stages them after format.

Cause: the function form tells lint-staged not to append file arguments, so every commit formatted ~1000 tracked files while only re-staging what the user had staged. Prettier touched EOF/CRLF on many paths; combined with lint-staged’s backup/restore, commits often finished with spurious unstaged `\ No newline at end of file` (or similar) diffs. Repo-wide format stays `pnpm format`; CI still uses `//#format:check`.

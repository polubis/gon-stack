# 0049 - Coord delegation, single log entry rule

```json
{
  "status": "done"
}
```

Reworked agent rules and nitpick checks.

- `.claude/rules/git.md`: removed "one decision/task/work means one commit".
- `.claude/CLAUDE.md`: every task starts with `coord`, placed below the aodi-framework read; `coord` never delegates or commits, shows proof, waits for acceptance.
- `.claude/agents/coord.md`: rewritten to solo flow with proof and acceptance gate.
- `.claude/rules/general.md`: diff has exactly one new log entry.
- nitpick: `log-entry` rejects more than one new entry; `rich-commit` text drops the one-commit sentence; tests updated (222); `.ai/` re-synced.

Reason: commits no longer need to be split per decision, and each commit carries exactly one log entry.

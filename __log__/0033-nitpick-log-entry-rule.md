# 0033 - Nitpick log-entry rule

```json
{
  "status": "done"
}
```

Added `logEntry` rule to nitpick: a commit must add a new `__log__/NNNN-slug.md` entry (rule `general.md` #3, template `templates/task-log.md`).

- `CheckContext.git.stagedAddedFiles`: files newly added to the index (`git diff --cached --diff-filter=A`), filtered by rule `include`/`exclude`.
- `packages/nitpick/src/rules/log-entry.ts` + `log-entry.md`: needs at least one staged new file matching `<...>/__log__/<NNNN>-<slug>.md`; heading `# NNNN - summary` must match file number; json `"status"` must be `done`, `failed` or `done-with-clarification`. Has `fix` text with template.
- `.nitpick/config.ts`: `rules: [richCommit, logEntry]`; `.ai/` re-synced.
- Tests: `log-entry.test.ts` uses real git repos (staged vs unstaged vs modified vs nested). Total 221 tests, 100% coverage. README + handoff updated.

Decisions:

- Only newly added files count: editing an old log must not satisfy "each session ends with an entry".
- Check reads the working tree via `readText`, not the index; fine for normal commits (`git commit -a`/partial staging of the log file itself is an edge case).
- Runs in `commit-msg` hook, so every commit needs a log entry, including tiny ones; `--no-verify` bypasses.

Reason: enforce the "session ends with a log entry" rule mechanically at commit time instead of relying on agent memory.

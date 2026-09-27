# 0011 - Require decision log entry via `log:check` in `ci:verify`

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

Added `scripts/log-check.mjs` and root `package.json` scripts `log:check` (default: `git diff origin/main...HEAD`) and `log:check --staged` for the index. The script fails when any changed non-exempt file lacks a **new or modified** `__log__/NNNN-*.md` in the same diff whose directory is the file path or an ancestor (`apps/parka/__log__` covers `apps/parka/**`; repo-root `__log__` covers the whole tree including root `scripts/` and `.claude/`). Validates task-log shape (header, json `status`, no template placeholders, ≥40 chars after json). `ci:verify` / `ci:verify:dry` run `pnpm hash:check && pnpm log:check && ...` (pre-push / deploy; PR CI hash-only per 0009 until Verify is restored).

Requirement: every changed file needs a new/modified `__log__/*.md` in the same diff, located in the file's own directory or any ancestor. Modes: `--staged` (index diff) and `--base <ref>` (`<ref>...HEAD`, default `origin/main`; empty diff on `main` passes). Exempt: `.md`, `pnpm-lock.yaml`, images, `__log__/` itself. A log must have a `# ` header, a json block with `status`, no unfilled `{id}`/`{summary}`/`{descriptionOfChanges}`/`{reason}` placeholders, and >= 40 chars of text after the json block (see `.claude/templates/task-log.md`).

Reason: each code change must carry a recorded decision and why it happened. Wired into `ci:verify` only (no pre-commit hook, no `pr-ci.yml` step): commits are atomic and PR CI is hash-only for now (see 0009), so PR CI does not enforce it until the Verify step is restored. The check validates log shape, not reason quality. Root-level files (`.github/`, `turbo.json`, `package.json`) need a root `__log__` entry; a log under `apps/parka/__log__` does not cover them.

Verified on real diffs: staged code change without log fails naming the file; `--base HEAD~1` flags root files covered only by an `apps/parka` log; staged `.md`-only changes pass.

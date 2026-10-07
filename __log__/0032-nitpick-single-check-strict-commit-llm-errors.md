# 0032 - Nitpick single check, strict commit rule, LLM-friendly errors

```json
{
  "status": "done"
}
```

Simplified the nitpick CLI to two modes, moved nitpick from turbo/CI to the `commit-msg` hook, made `rich-commit` strict and made violations readable for an LLM.

Package (`packages/nitpick`):

- CLI `nitpick [--sync | --check] [--commit-msg <file>] [--range <a..b>]`. A `--ci` mode existed for a short time (config + rule checks, no drift comparison) and was removed before commit. `--check` always does config validation, drift vs disk and every rule `check`.
- Violation guidance: after the `[id] ...` problems of a failing rule, `--check` prints `Violated rule: <id>. Read <path>` and `Fix: <text>`. Path is the rule's instruction file under the first `output` (root file for function instructions); `buildDocs` returns it as `rulePaths`. Applies also to a throwing `check`.
- `Rule.fix`: required when a rule has `check` (union type in `config.ts` plus config error `Rule "id": fix is required when check is defined`), optional otherwise.
- `richCommit` strict: after `type(scope)!: title` and a blank line only a `- ` list (nested `  - ` allowed). Rejected: blank lines inside the list, prose, any `Key: value`, footers and references (`Refs`, `Fixes`, `Closes`, `BREAKING CHANGE`), `Co-authored-by`, `Signed-off-by`, `Reviewed-by`, `Generated with/by`, robot emoji, also when hidden in a bullet. It carries a `fix` text with an example. Instruction `src/rules/rich-commit.md` states the strict format.
- Commit message file: CRLF normalized, `#` comment lines and everything after the git scissors line ignored (docs read: CRLF -> LF too).
- Tests: 212, 100% statements/branches/functions/lines. README and `NITPICK_HANDOFF.md` (moved to the package root) updated.

Repo root:

- `.husky/commit-msg`: `pnpm turbo run build --filter=@repo/nitpick --ui=stream` (cached, `dist` always fresh), then `pnpm nitpick --check --commit-msg "$1"`.
- `.husky/pre-commit`: unchanged, no nitpick.
- `turbo.json`: task `//#nitpick:check` removed; `//#nitpick:check` removed from `ci:verify` and `ci:verify:dry` in `package.json`. Script `nitpick:check` kept, `nitpick:ci-check` not added.
- `.gitignore`: `.ai/` removed. `.prettierignore`: `.ai` added. `.ai/AGENTS.md` and `.ai/rules/rich-commit.md` generated and committed.

Decisions:

- One `--check` instead of `--check` + `--ci`: the only difference was the drift comparison, which only mattered while `.ai/` was ignored. Same behavior locally and in hooks.
- Nitpick runs on `commit-msg` only, not in pre-commit/turbo/CI: the full check needs the commit message, and `ci:verify` stays about code. A bad message or drift is reported after `ci:verify` (git has no earlier hook with the message). `--no-verify` bypasses it; no CI backstop for now.
- Build through turbo in the hook instead of `[ -f dist/cli.js ]`: turbo cache makes it near-free and removes the stale `dist` risk.
- `.ai/` is committed (transitional dir, final output dir will differ): drift is checked against committed files, a fresh clone passes. After changing rules: rebuild, `pnpm nitpick:sync`, commit `.ai/`.
- `fix` required with `check`: an error without a next step is useless to an LLM; a rule without `check` cannot fail, so no `fix` needed.
- Supersedes from 0031: `.ai/` ignored, `richCommit` accepting trailers, `//#nitpick:check` in turbo and `--ci`-free scripts.
- Known limits: a footer disguised as an ordinary bullet (`- see ticket 123`) is not detected; `pnpm` adds `ELIFECYCLE` after nitpick output; `--sync` does not remove orphaned generated files.

Reason: nitpick should be simple to reason about (`sync` writes, `check` verifies everything), gate commits at the one place where the message exists, and tell an agent exactly which rule it broke, where the rule is and how to fix it.

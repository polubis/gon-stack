# Nitpick handoff (for another LLM)

State as of 2026-10-07. Branch `main`, nothing pushed. Do not push unless the user asks.

## What it is

`packages/nitpick` (`@repo/nitpick`): one definition of AI rules that (a) generates AODI docs for agents and (b) runs project checks. Config: `.nitpick/config.ts`. Full docs: `README.md` (English, current). Decision log: `__log__/0031-nitpick-docs-and-checks-engine.md`.

## Decided and implemented (2026-10-07, uncommitted)

- `--ci` removed (code, tests, README, root script `nitpick:ci-check`). Modes: `--sync` (write docs) and `--check` (default: config validation + drift vs disk + every rule `check`).
- Husky `pre-commit`: no nitpick, only `ci:format` and `ci:verify`.
- Husky `commit-msg`: `pnpm turbo run build --filter=@repo/nitpick --ui=stream` (cached, always fresh `dist`), then `pnpm nitpick --check --commit-msg "$1"` (runs ALL checks: config, drift, every rule).
- Turbo task `//#nitpick:check` and its entries in `ci:verify` / `ci:verify:dry` removed. No nitpick in CI (`pr-ci.yml` unchanged). Trade-off: `--no-verify` bypasses everything. If wired to CI later: `fetch-depth: 0`, `--range origin/<base>..<PR head sha>`, merge-commit skipping (not implemented), squash-merge decision.
- `.ai/` removed from `.gitignore` and generated/staged (transitional dir; final output dir will differ). After changing rules: rebuild, `pnpm nitpick:sync`, commit `.ai/`.
- LLM-friendly errors: after the `[id] ...` problems of a failing rule, `run.ts` prints `Violated rule: <id>. Read <path>` (instruction file under first `output`, or root file for function instructions) and `Fix: <text>`. `Rule.fix` is required when a rule has `check` (type-level union in `config.ts` + config error `Rule "id": fix is required when check is defined`); optional without `check`.
- `richCommit` is strict: body is only a `- ` list (nested allowed), no blank lines inside, nothing after it (no footer, trailers, `Refs`/`Fixes`/`Closes`, `Co-authored-by`, `Signed-off-by`, AI credits). Instruction `src/rules/rich-commit.md` updated, `.ai/` re-synced.
- Verified: 212 tests, 100% coverage, `check-types`, `lint`, `build` pass; `pnpm nitpick --check` exits 0 after sync.
- Commit plan (one decision = one commit, `.claude/rules/git.md`): (a) nitpick single `--check` + CRLF + comment stripping + tests/README; (b) `.prettierignore` `.ai`; (c) `.gitignore` + `.ai/`; (d) hooks (`commit-msg` builds via turbo) + `turbo.json` + `package.json` + handoff + log `0032`.

## Git state

- Committed locally: `f77dcac` (engine, commitlint removed, turbo task, README, 192 tests).
- Uncommitted (some staged, some not):
  - `src/run.ts`: `--ci` removed.
  - `src/docs.ts`: CRLF -> LF when reading instruction/knowledge files.
  - `src/snapshot.ts`: `--commit-msg` ignores `#` comment lines and everything after the git scissors line.
  - tests (`__tests__/docs-edge.test.ts`, `run-edge.test.ts`), README, root `package.json` (`nitpick:ci-check` removed).
  - `.prettierignore`: added `.ai`.
  - `.gitignore`: removed `.ai/`. `.ai/` generated and staged.
  - `.husky/commit-msg` (new) and `.husky/pre-commit`: see above.
  - this file (moved from repo root to `packages/nitpick/`).
- Not written yet: log entry `0032`.
- Commit message format (enforced by `rich-commit`): `type(scope)!: title`, blank line, `- ` list (nested allowed), no footer, no AI credits.

## How it works (current code)

- CLI `nitpick [--sync | --check] [--commit-msg <file>] [--range <a..b>]`. Exit 0 ok, 1 problems, 2 usage/unreadable input (bad flags, missing commit file, invalid range, no git repo), 3 config error.
- Rule: `id`, `instruction` (function or `{ file }` markdown; relative to `.nitpick/`, absolute allowed), optional `check`, `importance` A/O/D/I, `include`/`exclude` (globs via `path.matchesGlob`; `**` skips dot folders), `group` (only splits root docs into `## Rules for <Group>`).
- Output: first `output` entry gets full docs (`<path>/<root>`, `<path>/rules/<id>.md`, `<path>/<knowledge.dir>/<key>.md`); every next entry is one line `Follow instructions here: [..](..)`. Default `.ai/AGENTS.md`. Root file lines: `- [id](rules/id.md)` for file instructions, `` - `id`: text `` for function instructions.
- Knowledge: `knowledge.refs`, `ref()` in instructions, `{{ref:key}}` in markdown; validated (missing file, self ref, unknown ref, cycle, duplicate rule id).
- Ready-made rules: `richCommit`, `logEntry` (`@repo/nitpick/rules/log-entry`, group `general`, needs a new staged `__log__/NNNN-slug.md`); `richCommit` (`@repo/nitpick/rules/rich-commit`, group `git`). Instruction text: `src/rules/rich-commit.md` (copied to `dist` by `build`). `.nitpick/config.ts` is just `rules: [richCommit]`.
- Tests: vitest, 205 passing, 100% statements/branches/functions/lines enforced by thresholds (`cli.ts` excluded). Run in `packages/nitpick`: `pnpm test:coverage`, `pnpm check-types`, `pnpm lint`, `pnpm build`.

## Repo wiring (current)

- commitlint fully removed (config, deps, old `commit-msg` hook).
- `turbo.json`: no nitpick task.
- Husky `pre-commit` runs `pnpm ci:format`, `pnpm ci:verify` (includes e2e, takes minutes).

## Open items

1. Only `richCommit` exists. Other rules in `.claude/rules/*` are not ported; `.claude/CLAUDE.md` is still handwritten (do not overwrite it with generated output).
2. `--sync` does not delete orphaned generated files after a rule rename.
3. `cli.ts` has no smoke test; `MODULE_TYPELESS_PACKAGE_JSON` warning intentionally left; `pnpm` adds `ELIFECYCLE` noise after nitpick output (calling `node packages/nitpick/dist/cli.js` in the hook would remove it).
4. Commit timing: `commit-msg` runs after `pre-commit`, so a bad message is reported only after `ci:verify`. Git offers no earlier hook with the message.

## Gotchas learned

- Run prettier from the repo root. Prettier reads `.prettierignore` from the cwd, so running it in `packages/nitpick` reformatted `rich-commit.md` (adds blank lines inside the code block). `*.md` and `.ai` are ignored at root.
- After changing any `src/rules/*.md`, rebuild (`pnpm --filter @repo/nitpick build`) before `pnpm nitpick:sync`; the CLI reads the copy in `dist`, so a stale `dist` produces false drift in pre-commit.
- `core.autocrlf=true`: working files may be CRLF. Nitpick normalizes to LF on read; `sed` replacements on those files can miss, prefer the editor tool.
- In Git Bash, `//#task` args are path-mangled; use `MSYS_NO_PATHCONV=1` or PowerShell / `pnpm` scripts for `turbo run //#...`.
- `git stash list` contains an old `lint-staged automatic backup` from 2026-09-10 that is not from this work. Leave it.
- lint-staged can fail with "Failed to restore unstaged changes" when files are partially staged; `git update-index --refresh` and retrying worked.

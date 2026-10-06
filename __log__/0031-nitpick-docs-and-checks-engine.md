# 0031 - Nitpick docs + checks engine, commitlint replaced

```json
{
  "status": "done"
}
```

Built `@repo/nitpick` on top of the skeleton (0030) and moved commit validation from commitlint to it.

Package (`packages/nitpick`):

- CLI `nitpick [--sync | --check] [--commit-msg <file>] [--range <a..b>]`, exit 0/1/2/3. `--sync` writes docs, `--check` (default) diffs generated files and runs rule `check`s without writing. Config in `.nitpick/config.ts`. `src/index.ts` removed; modules are imported as `@repo/nitpick/<module>` (`config`, `rules/rich-commit`) via wildcard `exports`, bin `nitpick` -> `dist/cli.js`.
- Rules: `id`, `instruction` (function or `{ file }` markdown), optional `check`, `importance` (A/O/D/I), `include`/`exclude`, `group`. `rules` as array or function (typed `ref()`).
- Docs: first `output` gets full docs, every next one is `Follow instructions here: [..](..)`. Default `.ai/AGENTS.md`. Root file: `# Information for AI`, `## Rules` (ungrouped first), `## Rules for <Group>`, `### (A) Always` ... File instructions go to `rules/<id>.md`, linked as `- [id](rules/id.md)`. Knowledge via `knowledge.refs`, `ref()` and `{{ref:key}}`; validated for missing file, self ref, unknown ref, cycle, duplicate rule id.
- Ready-made `richCommit` (group `git`); its instruction is `src/rules/rich-commit.md` next to the rule, copied to `dist` by `build`.
- Hardening found by edge-case tests: CRLF commit messages, tracked-but-deleted files skipped, `ls-files -z` for non-ascii names, invalid `--range` / unreadable `--commit-msg` / no git repo = exit 2, throwing `check` = reported problem, empty rules = heading only.
- Tooling: vitest, `@vitest/coverage-v8`, `@types/node` added; `tsconfig.build.json` (excludes tests) used by `build`/`dev`, `tsconfig.json` adds `vitest/globals` types; `test` and `test:coverage` scripts. 192 tests, 100% statements/branches/functions/lines enforced by coverage thresholds (`cli.ts` excluded).
- Docs: `packages/nitpick/README.md` (replaces the untracked root `NITPICK.md`).

Repo root:

- commitlint removed: `commitlint` config and both `@commitlint/*` devDependencies from `package.json`, `.husky/commit-msg`; `pnpm-lock.yaml` refreshed (about 360 lines dropped, `@repo/nitpick` and vitest packages added). `skills:update` script also removed.
- Scripts `nitpick`, `nitpick:sync`, `nitpick:check`; `@repo/nitpick` as root devDependency.
- `turbo.json`: root task `//#nitpick:check` (depends on `@repo/nitpick#build`, `cache: false`), added to `ci:verify` and `ci:verify:dry`.
- `.nitpick/config.ts`: `rules: [richCommit]`.
- `.gitignore`: `.ai/` (generated docs are not committed).
- `.prettierignore`: `*.md`, Prettier no longer formats Markdown.
- `.claude/rules/git.md`: now three rules: one decision/task/work = one commit; conventional commit format without `Reviewed-by` / `Refs` trailers in the examples; no AI credits, refs or footer, only title + description as nested list.

Decisions:

- `group` only splits the root docs into areas, not output paths: one flat `rules/` folder, grouping stays a reading aid in `AGENTS.md`.
- Instruction markdown lives next to the rule in the library, not in the consumer's `.nitpick`: predefined rules ship their own text.
- Only the first output is full, others reference it: one source of truth, no drifting copies.
- `cache: false` on the turbo task: result depends on git history, not on file inputs.
- `.ai/` ignored: docs are generated, so `nitpick:check` compares against the local copy and a fresh clone needs `pnpm nitpick:sync` first.
- `richCommit` still accepts optional `Key: value` trailers although the git rule examples no longer show them.
- Not wired: no hook or GitHub workflow calls nitpick yet. On a PR checkout HEAD is a merge commit, so wiring `pr-ci.yml` needs a range without merges first. Nothing validates commit messages now that `commit-msg` is gone.
- Prettier ignores `*.md`: Markdown is content (rule instructions, logs, docs), and Prettier rewrote the commit example in `rich-commit.md` (blank lines around HTML comments inside the code block), which changes the text AI agents read. `format` / `format:check` / lint-staged already skipped `.md`; the ignore also covers editors and `prettier .`.
- Globs follow `path.matchesGlob`: `**` skips dot folders (use `.ai/**`).

Reason: one definition of AI rules that generates the docs and enforces the same rules in checks, replacing the separate commitlint setup.

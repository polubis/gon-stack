# 0023 - nitpick replaces hashy (`hash` + `manifests` checks, turbo, typed config)

```json
{
  "status": "done"
}
```

Decisions:

1. Removed `packages/hashy`, `skills/hashy`, `hashy.modules.txt`, `hash:check`. Old flow forced constant re-stamping and manifest edits.
2. New `@repo/nitpick` (same package setup as hashy). CLI `nitpick [check...] [path...] [--write]`; no check = all configured, in parallel. One file per check, no "cli" in check names: `src/hash.ts`, `src/manifests.ts`; `cli.ts` dispatches, `index.ts` = types + `defineConfig`.
3. Config: typed root `nitpick.config.mts` (`defineConfig`, real `RegExp`s, `path` exact or `match` regex, optional `doc`/`include`/`exclude`) instead of YAML. `.mts` because root `package.json` has no `"type": "module"` (`.ts` warned). Node 24 loads it natively; `yaml` dep dropped.
4. `hash`: target = dir or single file; hash kept in doc frontmatter (`version` dropped); tests/snapshots excluded by default. `--write` rewrites only the `hash:` value in place (old writer added a blank line + mixed EOLs per run). `AGENTS.md` kept next to code; only config is central.
5. Kept documented examples: only `apps/romantic-app/.../user-profile-setup/AGENTS.md`; all 18 `apps/parka/**/AGENTS.md` removed.
6. New `hasher` skill syncs `AGENTS.md` on drift; `document-module`, `feature-workflow`, `CLAUDE.md`, `templates/AGENTS.md` retargeted.
7. Errors: every failure prints Problem / Expected / Found / Fix on stderr. `hash` lists changed files via git since the last stamp commit; config errors say what to fix; one crashing check does not hide others.
8. Turborepo: root task `//#nitpick` (depends on `@repo/nitpick#build`; not cached, see 13), in `ci:verify*` and in the "Verify" steps of `pr-ci.yml` / `deploy-parka.yml`. Scripts `nitpick`, `nitpick:stamp`. On Windows Git Bash use `MSYS_NO_PATHCONV=1` for `//#nitpick`.
9. Versions: dependency versions are exact (`saveExact`): `@playwright/test` and `eslint-config` `typescript` aligned to exact. No `pnpm.overrides` for TypeScript (tried, reverted). The workspace-wide `versions` check was dropped; existing tools (pnpm catalogs, syncpack, sherif) cover it. `manifests` check added instead so the multi-check runner stays exercised.

10. Removed the old `outdated` verification: `deps:outdated` (`ncu --errorLevel 2`, any single outdated dep failed the build), its steps in `pr-ci.yml` / `deploy-parka.yml`, the `ci:check-updates` script and its `.husky/pre-push` line. Flaky. `pnpm audit` gate, manual `check-deps`/`update-deps*` and Dependabot stay.

11. Disabled turbo auto-written `AGENTS.md` agent block (`"agentGuidance": false` in `turbo.json`), removed the file.

12. `outdated` reintroduced as a nitpick check with thresholds instead of fail-on-one: counts unique package names (ncu `--jsonUpgraded`, all workspaces + root); one rule or a list of rules, each with its own `target` (patch/minor/latest...), `warn`, `fail`, `ignore`, reported separately; default rule minor, warn from 5, fail from 12 Warnings do not fail the run (GitHub `::warning::` annotation when `CI` is set). If ncu/registry cannot be reached it warns, never fails (flakiness). Currently 4 -> ok.
13. `//#nitpick` in `turbo.json` is `cache: false` (outdated depends on live registry state, cached results would go stale); inputs/outputs dropped.
14. Old hashy fully removed (package, skill, manifest, scripts, CI steps, doc refs); only historical log entries mention it.
15. Prettier check moved into Turborepo as root task `//#format:check` (cached, inputs = repo files minus `node_modules`/`dist`/`.turbo`/`.next`/`.worktrees`) and run in the same `turbo run` as `//#nitpick lint check-types test`, so CI runs them in parallel instead of separate sequential steps. `ci:verify*`, `pr-ci.yml`, `deploy-parka.yml` updated; the separate "Format check" steps are gone. Note: raw `pnpm install` rewrites `pnpm-lock.yaml` unformatted (blank line after `importers:`); run `prettier --write pnpm-lock.yaml` (lint-staged does it on commit).
16. `pnpm audit` became nitpick check `audit`: one rule or a list (like `outdated`), each with `level` (severity and above), `warn`/`fail` on unique vulnerable package names and its own `ignore` (names or advisory ids); one `pnpm audit --json` run, evaluated per rule; unreachable registry = warning. Default rule fails on the first vulnerability. Config: high fail 1, low warn 1. Removed `deps:audit`, `ci:security`, the "Audit" CI steps and their use in `ci:verify*`.
17. `log:check` moved into nitpick as check `log` (`src/log.ts`, config `log: { staged, exempt, minBodyLength }`; CLI `--staged`). Rule is per commit and per owning folder: each commit in `origin/main..HEAD` is checked alone; each changed non-exempt file is owned by the nearest folder above it with a `__log__` (root fallback) and the commit must add at least one new valid entry in every owning `__log__`; not per file. The base is hard-coded `origin/main` (no `BASE_REF`/env/flag/config); with nothing ahead of main (HEAD is main) the tip commit is checked. Runs: the Verify step of `pr-ci.yml`, the Verify step of `deploy-parka.yml`; locally it is covered by the pre-push hook (`ci:verify` includes `//#nitpick`), no pre-commit hook. Errors follow Problem / Expected / Found / Fix. Removed `scripts/log-check.mjs`, the `log:check` script, its use in `ci:verify*`, the separate "Log check" step in `pr-ci.yml`, and `passThroughEnv` in `turbo.json`.
18. CI kept simple: `//#nitpick` runs inside the single Verify step of `pr-ci.yml` and `deploy-parka.yml` (full-history checkout there, since `log` needs it); no separate nitpick job, no separate main workflow, no `changes` job; the deploy workflow keeps its path filter. A separate always-on nitpick job was tried and reverted as too complex; duplicate runs (pre-push `ci:verify`, PR CI, deploy verify) are accepted.

Open: pnpm 11 may run `pnpm install` before `pnpm <script>` when manifests changed (`verifyDepsBeforeRun` not set). Lockfile still holds `typescript` 5.9.3 transitively (peer resolution).

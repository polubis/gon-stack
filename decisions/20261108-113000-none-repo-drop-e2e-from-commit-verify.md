---
ticket: none
scope: repo
summary: Drop e2e from commit-time verify; relocate clean shell scripts
why: Pre-commit e2e is slow and blocks small commits; e2e will move to PR quality checks soon. Root-level clean scripts belong with other repo scripts.
date: 2026-11-08
supersedes: 20261003-000000-none-repo-run-verify-on-pre-commit
---

- `ci:verify` and `ci:verify:dry` no longer run `test:e2e`; pre-commit still calls `pnpm ci:verify` (format:check, lint, types, unit tests, build, audit unchanged)
- E2E stays manual via `pnpm test:e2e` / `pnpm ci:e2e` until PR CI adds it
- Moved `clean-turbo.sh`, `clean-modules.sh`, `clean-all.sh`, `clean-install.sh` to `scripts/`; `package.json` `clean:*` invokes them there; nested scripts resolve paths via `BASH_SOURCE`

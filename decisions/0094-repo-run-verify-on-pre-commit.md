---
ticket: none
scope: repo
summary: Run ci:verify on pre-commit, drop pre-push hook
why: Catch regressions at commit time with staged formatting first, instead of a separate push gate. Supersedes the pre-push part of 0078. PR CI and `ci:verify:dry` unchanged
date: 2026-10-03
supersedes: 0078
---

- `.husky/pre-commit` now runs `pnpm ci:format` then `pnpm ci:verify` (format:check, lint, types, unit tests, build, e2e).
- Removed `.husky/pre-push` (it only ran `pnpm ci:verify`).

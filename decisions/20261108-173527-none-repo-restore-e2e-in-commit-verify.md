---
ticket: none
scope: repo
summary: Restore e2e in commit-time verify
why: E2E gate on commit is wanted back; dropping it removed a safety net.
date: 2026-11-08
supersedes: 20261108-113000-none-repo-drop-e2e-from-commit-verify
---

- `ci:verify` and `ci:verify:dry` run `test:e2e` again after format, lint, types, test, build
- README gate rows and CI gate rule restored; `ci:e2e` row removed
- `scripts/` clean scripts move kept

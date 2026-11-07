---
ticket: VYB-246
scope: nitpick
summary: ref links rule groups, moves git and way-of-work rules
why: root doc links must use typed ref, and group names were not ref targets
date: 2026-11-07
---

- `ref` ids include rule group names: `ref('git')` links `rules/git.md`
- Config: `way-of-work` group (caveman, conventions), `git` group (decision-log, rich-commit, artifacts, branch from fresh main)
- Root doc: AODI legend injected, links via `ref` to `git` and `way-of-work`
- Tests: group ref in rule doc; type contracts include group names

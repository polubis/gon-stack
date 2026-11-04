---
ticket: none
scope: nitpick
summary: Require evidence output in per-key .evidences dir
why: Proof files must land in one predictable gitignored place, not scratch
date: 2026-11-04
---

- Evidence output goes to `.evidences/<KEY>/` at repo root
  - `<KEY>` = tracker key, `none` without a task, or `pr-<id>` for a PR
- Key is required input: ask for it when missing, do not run without it
- Scratch dir is for the scenario file and temp files only, never outputs
- Report paths are absolute and under `.evidences/<KEY>/`

---
ticket: none
scope: nitpick
summary: Factory agent rewritten as cyclic one-task Parka worker
why: Factory must run once per loop tick, track state in Parka and ship each task as a PR with evidence
date: 2026-11-11
tags: [agents, parka, automation]
---

- New `factory` agent in `.nitpick/config.ts`, caveman text, refs via nitpick `ref()`
  - one task per run, loop stays external
  - guard errors when lock, dirty tree, non-main branch or stash shows a task in progress
  - errors on tasks unrelated to the repo
- Statuses loaded from Parka MCP at run start and mapped by meaning (todo, started, finished, blocked), never hard-coded
  - blocker: blocked status if offered, else todo, plus a `BLOCKED:` comment
- Side finds (flaky tests, other issues) become backlog tasks with the same tag
- Evidence via `evidence` skill, `git stash` for BEFORE, never worktree, upload as task attachments
- Always cleans up: back on `main`, branch, lock, evidence and dev servers gone
- Permissions: `git push` allowed for `factory/*` branches
- No code tests: config-only agent text

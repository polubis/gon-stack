---
ticket: none
scope: claude
summary: Factory agent runs the backlog task by task
why: Working through the backlog by hand meant re-explaining the same flow for every task
date: 2026-10-25
tags: [agents, backlog, automation]
---

- New `agents/factory.md` loops over tagged todo tasks from Parka
  - plans up to 30 tasks, merges overlapping ones, orders by priority, starts at once
  - starts from a clean tree equal to `origin/main`
  - delegates each unit to `coord` with tests and evidence, no commit
  - commits, pushes and marks `done` only after dev accepts the proof
  - problems are reported plainly and the unit is skipped, then the next one runs
- Listed in the agents table of `CLAUDE.md`

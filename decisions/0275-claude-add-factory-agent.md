---
ticket: VYB-229
scope: claude
summary: Add factory agent for end to end ticket work
why: Ticket work needed one repeatable flow - stages, logs, worktree, PR, cleanup
date: 2026-11-02
tags: [agents, process]
---

- New `factory` agent in `.nitpick/config.ts` (generates `.claude/agents/factory.md`), short, links reference
- New ref `gon-stack-ecosystem-and-process` in `.nitpick/references/` holds stages A-D, stage-log template, git/parallelism rules, example run
- Ticket tool use limited to haiku subagent, category Automatyzacja

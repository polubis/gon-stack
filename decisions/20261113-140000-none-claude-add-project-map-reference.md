---
ticket: none
scope: claude
summary: Add project-map reference inserted into CLAUDE.md
why: Agents had no overview of apps, stacks and parka scripts, so every session re-explored the repo before working.
date: 2026-11-13
tags: [nitpick, references]
---

- New `.nitpick/references/project-map.md`, caveman style: apps (static vs full stack), parka backend, packages, misc
  - polubinski-dev and kdebek marked static, parka full stack with Supabase, AI receipt reader, MCP and db scripts
- Registered as ref `project-map`, inlined into CLAUDE.md with `insert('project-map')` in entry doc
- Agent setup simplification (drop boss/worker/doctor/factory) left for next step

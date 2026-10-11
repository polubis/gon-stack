---
ticket: none
scope: claude
summary: Replace 16 specialist agents with worker, coord, doctor
why: Fewer moving parts, clearer handoffs (dev → coord → workers → doctor), and lazy loading of rules/skills (catalog known upfront, contents read only when routing requires it)
date: 2026-10-09
---

- Removed the previous `.claude/agents/` roster (planner, lane specialists, verifiers) and kept three English personas: **worker** (scoped execution from upstream context), **coord** (simple tasks solo;
  - complex tasks via parallel plan + workers + test pyramid + basic repo checks), **doctor** (rules audit with fixes, proof, commit prompt, cleanup, close dev ports).
- Updated the Agents table in `.claude/CLAUDE.md` to match.
- Decision: one orchestrator, one executor, one closer — instead of many overlapping specialist files that duplicated routing already described in skills and `rules/`.

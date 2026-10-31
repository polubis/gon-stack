---
ticket: none
scope: nitpick
summary: Drop agent and skill lists from generated TOC
why: Agents and skills are auto-discovered from their folders; index lines cost context every session
date: 2026-10-31
tags: [toc, agents, skills]
---

- `output[].toc`: `agents` and `skills` flags, default on; gon-stack sets both off
  - Agent and skill files still written, only root index lists hidden
- gon-stack `CLAUDE.md`: Ecosystem section and skills routing table removed
- Agent docs inline in `.nitpick/config.ts` with typed `ref()` and `file()`; `.nitpick/agents/*.md` sources deleted
- `boss` agent added: scopes task, delegates to `worker`, relays acceptance

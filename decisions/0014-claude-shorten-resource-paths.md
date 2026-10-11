---
ticket: none
scope: claude
summary: Short `.claude` resource paths (no `.claude/` prefix)
why: Agents already work under `.claude/`; the full prefix was noisy and inconsistent
date: 2026-09-16
---

- Align resource paths under `.claude/` to short form: `rules/…`, `skills/…`, `references/…`, `templates/…` — no `.claude/` prefix.
- Touch `CLAUDE.md`, `rules/general.md`, `references/frontend-architecture.md`, plus skill docs with local `references/` / examples.
- Skill-local refs stay skill-relative (`references/todo.md`).

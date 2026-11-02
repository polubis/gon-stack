---
ticket: none
scope: claude
summary: Flatten skills out of `skills/framework/`
why: Nested `skills/framework/skills/` made catalog paths long and easy to mis-link
date: 2026-09-16
---

- Move framework skills to top-level `skills/`: `check-html`, `clone`, `do-ui`, `document-module`, `feature-workflow`, `hashy`, `plan-be`, `plan-db`, `plan-domain`, `plan-fe`, `plan-requirements` (+ `references/template.md`), `plan-ui`.
- Update `CLAUDE.md` skill links to `skills/<name>/SKILL.md` (no `framework/skills/` nest).

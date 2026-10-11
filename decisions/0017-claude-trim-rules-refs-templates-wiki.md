---
ticket: none
scope: claude
summary: "`.claude` rules, refs, templates, wiki trim"
why: Need single always-on rules file + clear frontend module map; old EDA-named ref + raw wiki + persona template drifted
date: 2026-09-16
---

- Add `rules/general.md` (standing A/O/D/I coding/style/test/AI policy) + `references/aodi-framework.md` (tag legend).
- Restore `references/frontend-architecture.md` (module layers guide); drop `references/eda-architecture.md`.
- Rewrite `CLAUDE.md` ecosystem index (rules/skills/refs/templates/agents/worktrees + skill table).
- Swap `templates/AGENT.md` → `templates/AGENTS.md`; remove `templates/reference.md`.
- Delete stale `wiki/raw/*` notes.
- Consequence: agents start at `rules/general.md` + `references/frontend-architecture.md`; module docs use `templates/AGENTS.md`.

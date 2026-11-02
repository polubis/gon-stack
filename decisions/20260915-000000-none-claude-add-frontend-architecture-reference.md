---
ticket: none
scope: claude
summary: Add frontend architecture reference doc
why: No single place documented how new apps/modules should slice domains and layer code — agents and devs inferred from scattered examples
date: 2026-09-15
---

- Added `.claude/references/frontend-architecture.md` — canonical guide for scalable frontend structure: domain-sliced `modules`, `shared`/`libs`/`core` layout, per-module layers (`presentation`/`core`/`integration`/`domain`)
  - low coupling + isolation over duplication.
- Example pointer: `apps/romantic-app/src/modules/user-profile-setup`.
- Moved root `CLAUDE.md` → `.claude/CLAUDE.md` so repo conventions + references live under `.claude/`.
- One reference under `.claude/references/` gives repeatable structure without coupling to one app.

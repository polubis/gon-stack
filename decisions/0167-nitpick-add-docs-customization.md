---
ticket: none
scope: nitpick
summary: Config docs option customizes generated root AGENTS.md
why: Root document header, intro and per group or importance text should come from config instead of fixed output
date: 2026-10-12
tags: [config, docs]
---

- New optional `docs` in nitpick config: `header`, `intro`, `ungrouped`, `groups`, `importances`
  - Texts are functions `({ ref, group?, importance? })` or `{ file }` with `{{ref:key}}`, inlined in root doc
  - Titles overridable; defaults keep output identical
- Config errors: missing file, unknown ref, `groups` key no rule uses
- Logic in `src/docs.ts`, types in `src/config.ts`; tests in docs-edge suite, README updated
- Repo wiring: `.nitpick/config.ts` sets header, intro, group and importance texts; `.ai/AGENTS.md` regenerated
- Root doc always has built-in `## AODI framework` legend below header, before intro (`AODI_LEGEND` in `src/docs.ts`), not configurable
  - Importance section titles keep the inline explanation (`(A) Always`, ...); `importances[tag].title` overrides

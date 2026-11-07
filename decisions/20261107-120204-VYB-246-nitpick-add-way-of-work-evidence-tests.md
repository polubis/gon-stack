---
ticket: VYB-246
scope: nitpick
summary: way-of-work adds evidence and tests rules after each work
why: every finished work needs proof and tests, not only the rule about caveman and conventions
date: 2026-11-07
---

- Config: `way-of-work` group gains `way-of-work-evidence` (links `evidence` skill via `ref`) and `way-of-work-tests` (e2e, unit, integration)
- Generated: `.claude/rules/way-of-work.md` items 3 and 4 via `pnpm nitpick:sync`
- No code tests: config-only rule text, covered by generated rule file

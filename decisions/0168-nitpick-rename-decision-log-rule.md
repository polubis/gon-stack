---
ticket: none
scope: nitpick
summary: Rename createDecisionEntry rule to decisionLog
why: Rule name should match its decision log purpose and stay consistent with richCommit style
date: 2026-10-12
tags: [rules, naming]
---

- Export `createDecisionEntry` -> `decisionLog`, validator -> `validateDecisionLog`, rule id -> `decision-log`
  - Files `src/rules/decision-entry.*` and its test renamed to `decision-log.*`
- `.nitpick/config.ts`, README, handoff doc and template pointer updated
- `.ai/` regenerated: `rules/decision-log.md` replaces `rules/decision-entry.md`

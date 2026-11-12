---
ticket: VYB-239
scope: claude
summary: Add gdpr skill drafting RODO document pack from the app
why: Dev needs reusable way to prepare RoPA, privacy policy and DPA grounded in real app data.
date: 2026-11-12
tags: [skill, gdpr, legal]
---

- Add `gdpr` skill in `.nitpick/skills/gdpr`, registered in `.nitpick/config.ts`
  - Flow: scan repo, gaps report, draft pack (RoPA, privacy policy, DPA art. 28, DPIA screening, TOMs, rights, breach)
- Unknown facts become `[TODO]` placeholders, never guessed
- Outputs are drafts needing lawyer review, stated in every file
- Skill only reads app, does not change code

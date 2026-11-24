---
ticket: VYB-1028
scope: parka/ux
summary: Remove one-word button name rule, restore descriptive labels
why: Rule 18 was too aggressive, one-word labels lost context (Dodaj, Zapisz, Ponów) and hurt clarity.
supersedes: 20261118-164500-VYB-952-parka-add-one-word-buttons
date: 2026-11-24
tags: [ux, nitpick]
---

- nitpick: drop `ux-button-name` from `.nitpick/config.ts`, `pnpm nitpick:sync` regenerates `.claude/`
- parka: revert VYB-952 label shortening (about 90 labels) and VYB-986 `Edytuj` back to `Edytuj profil`
- kept: VYB-976 ManageLink metadata flow, no per-picker "Nowy" shortcuts
- tests: unit labels back to descriptive names, drop unused `empty-state.ts` helper and VYB-986 one-word test
- evidence: one before/after collage of all changed labels

---
ticket: VYB-1062
scope: parka/access-tokens
summary: Animate create, update and delete of MCP token rows
why: UX rule 19 asks every create/update/delete to show a transition on the changed item; token list had none.
date: 2026-11-26
---

- Token list uses `useListChanges` + `changeProps`: created row grows in, updated row flashes, deleted row fades out and neighbours glide
- Empty state waits until the leaving row is gone (`rows.length === 0`)
- Token card is taller than 12rem, so `row-in`/`row-out` keyframes read `--row-max` (default 12rem), token row sets 24rem, no end jump
- Test: delete leaves list then empty state shows, with motion on (matchMedia stub)
- Evidence: one recording cycling 320, 480, 640, 768, 1024, 1280, 1440, 1920 px viewports on real local Supabase

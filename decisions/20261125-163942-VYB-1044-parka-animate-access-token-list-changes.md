---
ticket: VYB-1044
scope: parka/access-tokens
summary: Animate create, update and delete of MCP token rows
why: UX rule 19 asks for a visible transition on every changed item, token list jumped instead.
date: 2026-11-25
tags: [access-tokens, ux]
---

- list: `useListChanges` in `Main` feeds `TokenRow` a `phase`; create fades in, status change flashes, delete fades out and neighbours glide
- empty state waits until the leaving row is gone, so last delete animates too
- row uses shared `changeProps`, inert while leaving, `motion-reduce` disables all
- chose shared hook over new CSS to match categories, time and knowledge lists
- tests: existing unit suite stays green (jsdom counts as reduced motion, instant)
- evidence: Playwright recordings of create, pause, delete on 8 viewports 320-1920 against real local backend

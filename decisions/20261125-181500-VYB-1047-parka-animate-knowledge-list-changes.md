---
ticket: VYB-1047
scope: parka/knowledge
summary: Animate row changes in knowledge categories, catalogs, tags lists
why: UX rule 19 asks every create/update/delete to show a transition, the knowledge structure lists swapped rows instantly.
date: 2026-11-25
tags: [knowledge, ux]
---

- `ListDialog` rows now go through `useListChanges`: create slides in, update flashes, delete fades out and neighbours glide
- row extracted to `ListRow` with `changeProps` and `useEntrance`, same pattern as the categories dialog
- scope key is the entity, so switching between Kategorie, Katalogi and Tagi never animates
- local `stagger.ts` copied per module convention (categories and time keep their own)
- reduced motion keeps instant changes via existing `motion-reduce` classes
- tests: existing knowledge unit suite stays green, jsdom has no matchMedia so changes are instant there
- evidence: one grid recording of 8 viewports 320-1920 px, add then edit flash then delete in the Kategorie list
- found: topic form at 320 px clips the "Do backlogu" button horizontally, out of scope

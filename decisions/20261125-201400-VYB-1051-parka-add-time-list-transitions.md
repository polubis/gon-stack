---
ticket: VYB-1051
scope: parka/time
summary: Add list transitions to time Priorytety and Kategorie dialogs
why: UX rule 19 wants create fade-in, update flash and delete fade-out on lists. Time priorities and categories lists swapped rows instantly.
date: 2026-11-25
tags: [time, ux]
---

- area: `PrioritiesDialog` and `CategoriesDialog` in time module, lists rendered rows directly from context
- change: rows go through shared `useListChanges` with `changeProps` and `useEntrance`, same as finance Kategorie and backlog
- first load not animated, scope tied to `initializing`; empty state waits for leaving rows to finish
- all motion off under `motion-reduce`, no new tokens or styles
- tests: unit for new priority appearing in the list under the form
- evidence: one webm walking 8 viewports (320 to 1920) with create and delete on real backend

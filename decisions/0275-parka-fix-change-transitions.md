---
ticket: VYB-202
scope: parka/transitions
summary: Fix transition replay and last-item delete exit in parka lists
why: Review found entrance animation replaying on created rows and no exit animation when the last item is deleted
date: 2026-10-31
tags: [ux, animation, bugfix]
---

- `useEntrance` hook: rows present at mount animate in once, stops on animation end, never keyed off row phase
  - Rows created later never replay it when returning to idle
- Day view and dashboard expenses show the empty state only after the last row has exited
- `in` phase clears after 400ms, separate from the 1200ms flash timer, so `overflow-hidden` no longer lingers
- Month-expenses last-delete path has no dedicated test
---
ticket: none
scope: parka
summary: parka time week view renders every task with the shared task row
why: all-day and recurring tasks showed as chips without a done toggle
date: 2026-10-21
tags: [parka, time, ux]
---

- Week view (cards and hour grid) uses `TaskRow` for all-day, timed and recurring tasks
  - Same shape everywhere, done toggle included
  - Removed the week-only `Chip`
- `TaskRow` wraps its meta on narrow cells
- Week device test now checks the shared row and its done toggle

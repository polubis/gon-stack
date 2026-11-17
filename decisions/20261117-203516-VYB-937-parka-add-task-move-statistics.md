---
ticket: VYB-937
scope: parka/time
summary: Show how many tasks were moved in the viewed period
why: Moving a task again and again says something about the user; stats now count moves per day, week, month and year.
date: 2026-11-17
tags: [parka, time, stats]
---

- A move is a day change between two days, already written to task history by the database trigger, so no migration
  - Planning a backlog task or sending one back is not a move
- New read endpoint `GET /api/time/moves/` (history rows with field day, own user, newest first, capped at 5000)
  - Returns task id and instant with a day of slack; the client sorts instants into its own time zone
- Stats get a "Przeniesienia" card: moves in the period and different tasks moved; re-read when tasks change
- Period options were not unified: finance has a custom range, time has none; split to VYB-947 because it needs a route and a view
- Kept clear of PR #140 and #141: no change to screen, skeleton, handlers, facade, repository or the recurring scope dialog

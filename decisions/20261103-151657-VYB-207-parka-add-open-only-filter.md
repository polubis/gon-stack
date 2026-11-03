---
ticket: VYB-207
scope: parka/time
summary: Open-only filter on time task lists
why: Done tasks clutter day, week, month and year lists; a switch hides them
date: 2026-11-03
---

- Switch `Tylko niezrobione` in the `Zadania` tab hides done tasks in day, week, month and year views
  - Lists read `visibleTasks`; `tasks` stays full for modals, lookups and stats
- Choice kept in `localStorage` (`parka:time-open-only`), per viewer; storage errors fall back to in-memory state
- Empty state under the filter reads `Brak niezrobionych zadań`
- Backlog untouched: its tasks have no status
- Tests: 3 unit (hide, empty message, remembered choice); 1 real-backend e2e (done + open task, switch, reload)
- Proof: `vyb-207-filter.webm` (390px, captioned), frames, responsive board 320-1920 in `.evidences/`
- Limits: proof uses mocked API for the video and board; e2e run on real backend after rebuild

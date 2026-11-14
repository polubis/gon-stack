---
ticket: VYB-907
scope: parka/time
summary: Add filters and sort drawer to tasks, driven by the URL
why: Task lists had only an open-only switch; the task asks for an ecommerce-style filter form in the account drawer look, routed, with clear empty states.
date: 2026-11-14
tags: [parka, time, filters, routing]
---

- New `Filtry` button in the time header next to Backlog and notifications; badge counts narrowing filters
- Drawer `FiltersDrawer` copies the account drawer shell (hero header, right drawer); lives in the modal stack as `?modal=filters`
- Filters: phrase (title and description), status, category, priority, time of day, recurring; sort by time, priority or name
- Filter values live in query params (`q`, `status`, `cat`, `prio`, `timing`, `rec`, `sort`); a link or reload restores them, Back and Forward re-read them, period switch day/week/month keeps them
- Pure logic in `domain/filters.ts`; `visibleTasks` in the time context is now `applyFilters`, `tasksOn` takes the sort
- Empty state with filters names them (`Brak wyników: Zdrowie`) and offers clear filters or add task
- Removed the `Tylko niezrobione` switch and its localStorage: the status filter replaces it, no duplicate control
- Tests: unit for filters, RTL flow for the drawer, e2e on real backend updated; proof is a recording, untrimmed ffmpeg-less

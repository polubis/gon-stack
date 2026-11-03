---
ticket: VYB-218
scope: parka/time
summary: Statistics tab in the time module
why: Tasks had no overview of progress; the finance dashboard layout gives it a familiar shape
date: 2026-11-03
---

- Time screen has tabs `Zadania` / `Statystyki`, tab kept in `?view=stats`, survives day/week/month/year switch
  - Same period control, swipe and load as the lists: no extra request
- Stats derived only from loaded tasks and backlog: pure `domain/stats.ts`, no new API
  - Hero: completion %, total, tasks per day, overdue (open, day before today)
  - Cards: status donut, category donut, priority bars, tasks over time (day: by hour), in-progress list, details (timed, all-day, recurring, busiest day, backlog)
  - Empty period: empty state naming the period; skeleton mimics the dashboard grid
- Tabs follow the tabs pattern: roving tabindex, arrows/Home/End, `aria-controls` + `tabpanel`; chart bars are focusable with a focus tooltip
- Shared `Donut` got optional `format` (value beside share) and stacks on narrow screens
- No timestamps on tasks, so no time-in-progress or trend vs previous period

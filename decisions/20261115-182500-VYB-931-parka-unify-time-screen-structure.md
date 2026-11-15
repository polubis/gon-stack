---
ticket: VYB-931
scope: parka/time
summary: Unify the time screen with the finance layout
why: Statistics sat in a separate tab; finance shows summary, list and charts on one page in one grid, so time now does too.
date: 2026-11-15
tags: [parka, time, ux]
---

- Removed the Zadania/Statystyki tab, the `view` param and `TimeView` from context and constraints
- One `xl:grid-cols-12` container with finance gaps holds summary, period tasks and statistics cards as direct grid items
  - Empty period shows only the empty state; loading shows summary skeleton above the view skeleton
  - Day list sits beside the stats at half width like finance; week, month and year take the full row
- Mobile order is exactly summary, tasks, statistics: all statistics cards (status included) follow the tasks in DOM, so tab and reader order match
  - On xl the status card moves up beside the summary with `order` only, grid unchanged
- Sort fix: title and priority orders now apply across timed and whole-day tasks in day and week cards (were grouped by hour first); week hour grid follows the sort
- Tests: stats-flow rewritten for one page and DOM order, day order tests, real-backend e2e for section order on desktop and 320px phone

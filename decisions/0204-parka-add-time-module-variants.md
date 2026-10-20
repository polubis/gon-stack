---
ticket: none
scope: parka
summary: Add static "Czas" task module with day/week/month/year views
why: Show the tasks idea as dummy UI before building logic
date: 2026-10-20
tags: [parka, time, tasks, ui, prototype]
---

- New module `modules/time` (presentation + dummy config only, no state/backend)
  - Routes: `/app/time/` day, `/week/`, `/month/`, `/year/`
  - Range control mimics finance `PeriodControl` (arrows, title, kind popover) with static markup; kinds are links
- Day: task list; week: 7 days with tasks; month: calendar with task dots; year: 12 months with counts
- Bottom/side nav gets "Czas" tab
- Hardcoded Polish data

---
ticket: VYB-211
scope: parka
summary: Unfinished tasks notification lists today and total not-done
why: Warning showed only a count of today's tasks; user wants today's tasks named and the overall not-done count
date: 2026-10-31
tags: [parka, time, notifications]
---

- `time-day-unfinished` payload gets optional `totalOpen`: not-done board tasks with day <= today (overdue + today)
  - Optional so rows stored before stay valid
  - Backlog (no day) not counted
- Push/body text: `Dziś: <up to 3 titles> +N · Niezrobione łącznie: M`
- Notification row shows the same text; old rows without `totalOpen` keep `Do zrobienia: N zadań`
- Still one notification per day, still only fired when today has open tasks
- Count via head-only `count: exact` query, no extra rows fetched

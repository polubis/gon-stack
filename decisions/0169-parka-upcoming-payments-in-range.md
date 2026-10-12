---
ticket: none
scope: parka
summary: Upcoming payments limited to the selected range, latest first
why: Dashboard announced payments beyond the chosen period; dev wants the list latest date first
date: 2026-10-12
tags: [dashboard, recurring]
---

- `upcomingCharges` takes optional `period`; keeps only payments inside it
  - Keeps the nearest 3, then displays them descending (latest date first)
  - `MonthExpenses` passes the selected period; popup lookup in `Main` stays unbounded so deep links still resolve
- Tests: selector range + descending order, UI hides list when next payment is beyond the range
  - Dashboard e2e pins a fixed present (3rd of month) and a weekly rule so its next payment stays in the month view

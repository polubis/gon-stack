---
ticket: none
scope: parka
summary: Parka expense date+time and alphabetical categories
why: Deterministic, simple default ordering, no extra sort mechanism
date: 2026-10-10
---

- Dashboard expenses tile shows date + local time (`shortDateTimeLabel`, user time zone).
- Date sort is by timestamp only (`Date.parse`, ties keep order).
- Categories sorted alphabetically by displayed label (`pl` collator) via `useSortedCategories` in the facades of categories, dashboard, data-export, expenses-management, reports, so listing and every picker share one order.
- Expense form default category is now the first alphabetical one; one test adjusted.

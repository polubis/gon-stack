---
ticket: VYB-279
scope: parka/time
summary: Move task statuses entry from header icon to add menu
why: Statuses editor belongs with other create/manage actions behind the main plus; top icon was clutter.
date: 2026-11-11
---

- Add "Statusy zadań" item to time AddMenu (mobile FAB and desktop Dodaj)
- Remove StatusesButton header icon and its time:statuses-open e2e id
- Update unit, menu-list and e2e specs to open editor via menu
- Dashboard add-menu untouched, statuses live only in time module

---
ticket: none
scope: parka
summary: Time module gets a backlog of tasks without a day
why: Ideas had to wait outside the app until a day and hour were known
date: 2026-10-21
tags: [parka, time, backlog, modal-stack]
---

- Backlog task = `time_tasks` row with `day` null (migration `20261022090000_time_backlog.sql`)
  - Check: no hour, not done, no rule while `day` is null
  - Moving = existing `PUT /api/time/tasks/:id/` with a day (whole day)
- `POST /api/time/backlog/`, `PUT /api/time/backlog/:id/` (edit, stays in backlog); `GET /api/time/` also returns `backlog`
- UI: icon-only header button with count badge on mobile (like the bell), labelled on desktop; add menu "Do backlogu"
  - URL modals `backlog` (list), `backlog-new`, `backlog-edit:<id>`; delete via confirmation
  - Row: title opens edit form, buttons Dziś / Jutro / viewed day, date input for any day, delete
  - Skeleton, empty state, optimistic add/edit/move/delete with rollback and toasts
- Tests: backlog flow (jsdom), contracts, real-backend e2e; fake backend extended

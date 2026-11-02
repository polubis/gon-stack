---
ticket: none
scope: parka/time
summary: One task row everywhere with status cycle and quick actions
why: Backlog and board lists behaved differently, a row click opened the editor and statuses needed the menu
date: 2026-10-24
tags: [parka, ux, time, tasks]
---

- `TaskRow` renders board and backlog tasks; the separate backlog row and its move buttons are gone
  - row click opens details, edit is a pencil icon next to "more"
  - status button cycles todo (circle), in progress (spinning arc, static arc with `motion-reduce`), done (check, struck title), todo; `aria-checked` is `mixed` while in progress; toast per change
  - "more" menu: move to today (backlog only), tomorrow, next week (Monday), put in backlog, delete via confirmation; backlog rows keep the day picker there
  - "Szczegóły" and "Rozpocznij/Wstrzymaj" menu items removed, action buttons shrunk to `h-8 w-8` for narrow week columns
- `[TRIGGER]_UPDATE_TASK` takes an optional toast `message`
- New `[TRIGGER]_SEND_TASK_TO_BACKLOG` handler (optimistic, rollback, retry toast) and `POST /api/time/backlog/[id]` (`send-time-task-to-backlog`): clears day, hour, done, in progress; refuses tasks made by a series (404)
- Tests: row click, status cycle, tomorrow / next week / backlog moves and failures, series task has no backlog action; vitest 865 pass, lint and `astro check` clean
- Not run: `time.spec.ts` (needs real Supabase backend), updated to the new row controls

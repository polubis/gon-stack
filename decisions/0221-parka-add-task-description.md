---
ticket: none
scope: parka/time
summary: Task title max 160; optional task description max 5000
why: 40 chars cut real task names; tasks had no place for longer notes
date: 2026-10-22
tags: [parka, time, task, description, migration]
---

- Task title limit 40 -> 160 (own `TASK_TITLE_MAX_LENGTH`; `NAME_MAX_LENGTH` stays 40 for category/priority/device names)
  - Zod `timeTask`, `timeBacklogTask`, `timeRecurring`; migration `20261023090000` redoes `title` check on `time_tasks` and `time_recurring`
- New optional `description` (max 5000, trimmed, empty -> null) on task, backlog task and recurring rule; DB check `1..5000` or null; rule copies it to each occurrence
- Form: `DescriptionField` (textarea, counter, x clear) + fullscreen editor as URL modal `description-editor` stacked over the form, edits live-synced, Esc closes
- Read-only details modal `task-view:{id}` (info icon on task and backlog rows): description clamped to 3 lines, "Pokaż więcej" opens `task-description:{id}` with full scrollable text
  - Description never shown in lists or cards
- Tests: contracts, form, editor, details (vitest); real-backend e2e for 160 title + description round trip
- Evidence video + screenshots in root `.evidences/` (ignored), BEFORE from HEAD worktree, mocked backend

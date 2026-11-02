---
ticket: none
scope: parka/time
summary: Add unique Jira-like key to every task
why: Tasks had no short human-readable identifier to refer to in lists, details and MCP
date: 2026-10-26
tags: [parka, time, tasks, supabase]
---

- DB (`20261028090000_task_keys.sql`)
  - `time_task_keys`: random 3-letter prefix per account (unique) plus running counter, RLS on, no policies
  - `time_tasks.key` (`ABC-7`), unique per account, set by `before insert` trigger so app, MCP and recurring rules all get one
  - `assign_task_key` is `security definer`: callers (authenticated) cannot execute `next_task_key`
  - `before update` trigger keeps the key immutable; existing tasks backfilled oldest first
  - `mcp_task_json` and `mcp_list_tasks` return `key`
- Contract and mapping
  - `key` added to `timeTask` and `timeBacklogTask`, server-set, ignored on input
  - `Task.key` / `BacklogTask.key` are `string | null` until the server answers; create handlers copy the saved key
- UI
  - New `TaskKey` shown first in the task row meta line (list and backlog) and above the title in task details
  - While `key` is `null` (optimistic create) it renders a `Skeleton` of the same box (`h-4 min-w-12`), so the line does not jump when the key arrives; `motion-reduce` stops the pulse
  - Row meta line is always rendered now (it always holds the key slot)
- Tests
  - `task-key.test.tsx`: list, details, backlog, placeholder while a new task waits, then its key; mock backend assigns keys like the server and can delay creation
- Not done: key is not searchable, not shown in notifications; gaps in numbers possible after failed inserts; keys longer than 6 characters widen the slot

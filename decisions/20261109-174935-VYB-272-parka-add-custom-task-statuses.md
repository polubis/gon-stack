---
ticket: VYB-272
scope: parka/time
summary: Custom task statuses between open and done, in UI, API and MCP
why: Let each user shape the workflow a task circle walks through without migrating any existing task
date: 2026-11-09
tags: [parka, time, mcp, migration, a11y]
---

- Workflow is open (fixed), the user's ordered steps, done (fixed); default list is the built-in `in_progress` step, so nobody sees a change until they configure
- No data migration: `done` and `in_progress` stay; new nullable `time_tasks.status_id` names a custom step of a started task, `null` is the built-in step
  - Table `time_statuses` (id, name, position) per user with RLS; only steps are stored, none is seeded
  - Deleting a step sends its tasks back to the built-in one (`on delete set null (status_id)`), check keeps `status_id` only on started, not done tasks
- API: `PUT /api/time/statuses/` replaces the whole ordered list (`in_progress` must stay, names unique, max 10); list response carries `statuses`; task contract has `statusId`
- UI: header "Statusy" dialog edits a draft (rename, move up/down, add, remove) saved as a whole; circle click goes to the next step then wraps; task form has a status select; row badge and details show the step name
- MCP: new `list_statuses`; `set_task_status`, `update_task` and `list_tasks` take `open`, `done`, `in_progress` or a custom step id or name; tasks carry `statusName`
- History: new `status` field records moves between started steps by name
- Tests: pgTAP, MCP endpoint, domain workflow, dialog and row flows, real-backend e2e

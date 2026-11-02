---
ticket: none
scope: parka/time
summary: Task status in progress in UI, API and MCP; no autofocus in forms
why: Show started tasks clearly, let MCP clients set them, stop forms from raising the mobile keyboard
date: 2026-10-24
tags: [parka, time, mcp, migration, a11y]
---

- Task has three states: open, in progress, done; `in_progress` column beside `done`, never both (check constraint)
  - Migration `20261025090000`: column, constraint, `mcp_list_tasks` / `mcp_get_task` / `mcp_set_task_status` report and accept `in_progress`
  - Contract `inProgress` defaults to false; create/update store it only when not done
- UI: row has "W trakcie" toggle (`aria-pressed`), badge and accent border; done clears it; edit dialog has a matching switch; details show it
- MCP: `set_task_status` accepts `in_progress`, `list_tasks` filters by it, task output status includes it
- Forms: removed `autoFocus` from text inputs (category, priority, token, suggestion rename, sheet); shells focus the dialog itself, no mobile keyboard on open
  - Dialog shells and sheet scroll with `touch-pan-y` and `overscroll-contain`
- Tests: MCP status and filter, contract default, row and dialog flows, focus and scroll of forms

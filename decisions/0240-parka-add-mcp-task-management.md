---
ticket: none
scope: parka/mcp
summary: MCP covers every operation of the tasks UI
why: MCP could only flip a task open or done, so an LLM could not move backlog tasks to a day, edit, create or tag them
date: 2026-10-26
tags: [parka, mcp, time]
---

- Tasks have no separate tags: the tag is the task category (e.g. `Automatyzacja`)
  - tasks already expose `categoryId` and `categoryName`; `list_tasks` gains `category` filter (id or name, case-insensitive)
- New tools: `create_task`, `update_task`, `delete_task`
  - `update_task` patches title, description, category, priority, status, day, hour
  - `day: null` sends a task to the backlog, a day moves a backlog task onto the board
  - category and priority accept id or name
  - `set_task_status` stays, now the same rules as `update_task`
- Delete is its own tool, `delete_task`, destructive hint, needs `confirm: true`
- Categories: `list_categories`, `create_category`, `update_category`, `delete_category` (refused while in use)
- Priorities: `list_priorities`, `create_priority`
- Migration `20261026090000_mcp_task_management.sql`: `mcp_*` functions, owner resolved from token, `PT400` for readable refusals
  - `McpInputError` turns `PT400` into a tool error the model can read
- Not covered: recurring rules (materialized in server TS, not SQL)
- Tests: mocked-gateway unit tests for the new tools; access-tokens e2e updated for the 14-tool list

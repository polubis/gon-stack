---
ticket: none
scope: parka/mcp
summary: Expose task key in MCP task output
why: DB returned `key` but MCP output schema stripped it, so clients could not read it
date: 2026-10-27
tags: [parka, mcp, tasks]
---

- `task()` output schema in `server/mcp/tools.ts` gains `key`; covers list_tasks, get_task, create_task, update_task, set_task_status
- Test: listed task carries `key`
- Not done: lookup by key (id-taking tools still need the id; would need new migration rewriting mcp_* functions)

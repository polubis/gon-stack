---
ticket: VYB-256
scope: parka/time
summary: Add a read only history of changes to every task
why: Owners and MCP clients could not tell who changed a task, when and from what
date: 2026-11-09
---

- Table `time_task_history` is append only and filled by database triggers, so the app, MCP functions and recurring materialization are all covered without trusting a caller
  - Recorded: creation, each changed field (title, description, category, priority, day, hour, done, in progress) with old and new value, attachments added or removed, comments added, edited or removed
  - Category and priority are stored by name at write time, so a later rename does not rewrite the past
  - Saving unchanged values records nothing; values are cut to 500 characters
- Nobody edits it: `authenticated` has `select` only (own rows), no insert, update or delete grant or policy, and no write endpoint or MCP tool exists
  - Rows leave only with their task (foreign key cascade); cascaded comment and attachment deletes write nothing
- Who did it: `mcp_user` stores the calling token id in a transaction local setting, and the trigger signs the row with token name and first 8 chars of its id, same as comments; no secret is stored
  - A forged setting is out of reach: PostgREST does not expose `set_config`
- Read paths: `GET /api/time/tasks/:id/history/` and MCP tool `get_task_history`, both newest first
- UI: collapsed "Historia zmian" section in task details, fetched on open and on every reopen; skeleton, error with retry, empty state
- Chose triggers over writing history in each procedure and MCP function: one place, no path can forget it
- Proof: pgTAP, unit, MSW integration, real backend e2e, evidence video in `.evidences/VYB-256`

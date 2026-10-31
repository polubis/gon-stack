---
ticket: VYB-217
scope: parka/time
summary: Add optional task comments with MCP bot authors
why: Owner and MCP bots need notes under tasks; bots sign by token name and short ref, never the secret
date: 2026-10-31
tags: [comments, mcp, supabase]
---

- Table `time_task_comments`: owner-only RLS; owner may insert and update only text, bot columns and `edited_at` locked by column grants and trigger
  - Cap 200 comments per task
- Bot identity: `mcp_token_id`, name snapshot, `bot_ref` = first 8 chars of token row id; secret never stored or returned
  - Live token name shown while token exists; snapshot after deletion
- API: list/create under `/api/time/tasks/:id/comments/`, edit/delete at `/api/time/comments/:id/`, rename token via `PATCH /api/mcp-tokens/:id`
- MCP tools `list_task_comments`, `add_task_comment`; no MCP edit or delete by design
- Time UI: comments in task details, optimistic add/edit/delete with toasts, delete confirmed in URL modal
  - Owner-edited bot comment shows split avatar (owner left, bot right)
- Access tokens UI: rename dialog; name signs bot comments

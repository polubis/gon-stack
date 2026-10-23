---
ticket: none
scope: parka/mcp
summary: MCP server endpoint with panel-managed access tokens
why: LLM clients need to read tasks and expenses and finish tasks, with user-owned revocable credentials
date: 2026-10-24
tags: [parka, mcp, tokens, security, migration]
---

- `POST /api/mcp/`: MCP Streamable HTTP, stateless JSON mode, hand-written JSON-RPC 2.0 (`initialize`, `ping`, `tools/list`, `tools/call`); no SDK (workerd weight)
  - Bearer auth on every call, Origin must be same-site, 64 KB body cap, no batching, GET/DELETE 405, no-store
  - Tools: `list_tasks`, `get_task`, `list_expenses`, `get_expense` (readOnly) and `set_task_status` (only write, idempotent, non-destructive)
  - Zod strict input + output validation, `structuredContent` + `outputSchema`, opaque cursor pagination (max 100)
  - Rate limit in memory per token and per client for failed auth; best effort per isolate, hard limit belongs in a Cloudflare rule
  - Token never logged or echoed; unknown/expired/revoked token -> 401 + `WWW-Authenticate`
- Migration `20261024090000`: `mcp_tokens` stores SHA-256 only; `token_hash` unreadable by every API role via column grants; RLS owner policy; max 10 per account
  - No service key: endpoint calls anon-granted `security definer` `mcp_*` functions that hash the raw token, check not revoked and not expired, and filter every row by owner
  - Last use recorded at one-minute granularity
- Panel API `/api/mcp-tokens/` (list, create, rotate, revoke, delete) via `privateProcedure`; secret (`parka_mcp_` + 256 bits) only in create/rotate response
  - Rotation swaps the secret and restarts the lifetime; revoked tokens cannot be rotated or re-enabled
- UI `modules/access-tokens` at `/app/access-tokens/` (link in Settings): list with masked token, status, last used, expiry; create dialog (name, lifetime 1/7/30/90/365 days or never); one-time secret dialog kept in memory only, not in URL
  - Rotate, disable, delete each behind a URL-stacked confirmation; disable/delete optimistic with rollback; create/rotate not optimistic (secret comes from server)
  - Skeleton, empty state, error state, toasts, loading banner; checked at 320 and 1440 px with axe
- Tests: 28 endpoint/protocol (vitest), 15 panel flow (vitest + msw), real-backend e2e (owner flow, cross-account isolation, phone width), screens a11y entry; expiry and column privileges proven in psql
- Hardening: failed-auth limiter checked before any DB call; client key from `cf-connecting-ip` only; limiter map capped; body capped while streaming; cursor offset capped; per-user advisory lock in token-limit trigger

---
ticket: VYB-297
scope: parka
summary: One-time upload URL replaces base64 and bearer attachment upload
why: Agents could not upload binaries - base64 must be retyped by the model and the bearer endpoint needs a token from a config file the permission classifier blocks
date: 2026-11-13
---

- New MCP tool `request_attachment_upload(taskId, name, mimeType)` returns `uploadUrl` for `POST /api/mcp/uploads/?ticket=`, raw bytes, no Authorization header
- Ticket: 256 bits random, only SHA-256 stored, bound to task, name, type and requesting token, 5 min TTL, burned on first use (even when the file is then rejected)
- Removed: tool `add_task_attachment`, route `/api/mcp/attachments/`, SQL `mcp_add_task_attachment`, base64 decoding, 28 MB JSON body cap (now 1 MB)
- Kept: allowed types, 5 MB / 20 MB video limits, 5 files per task, WebP re-encoding, history signed as the bot token, live refresh of the owner app
- Upload runs as `anon` with header `x-upload-ticket`: storage insert/delete policies allow only the ticket owner folder until the row is recorded (10 min max)
- Leak control: unknown, used and expired tickets answer the same 401, errors never echo the ticket, 20 failed tries per client are rate limited
- Rejected: stateless HMAC URL (cannot be one-time without storage) and service-role key in the worker (new secret, wider blast radius)
- Factory spec and tool description now teach only the new tool; PR #79 (`scripts/parka-upload.mjs`) is not on main and must be dropped when it lands
- Proof: vitest handler suite (expired, reused, wrong type, size limits, no leak), pgTAP ticket suite, live run with local Supabase - 3 MB mp4 stored, reuse 401, old route 404

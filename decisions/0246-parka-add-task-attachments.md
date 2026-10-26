---
ticket: none
scope: parka
summary: Add task attachments with image compression, previews and MCP tools
why: Tasks need files (photos, pdf) attached; big photos must not eat storage
date: 2026-10-26
tags: [tasks, attachments, storage, mcp, images]
---

- Attachments managed in task details: max 5 files, 5 MB each, png/jpeg/webp/gif/pdf/text
  - Private Supabase bucket + `time_task_attachments` table, owner RLS, 5-file trigger
  - Own REST endpoints under `/api/time/*`, not the `/api/state` sync
  - Delete via stacked URL confirm modal, optimistic with rollback
- Images re-encoded server-side to lossy WebP q75, same pixel size; animated GIF and larger results kept as is
  - Upload up to 5 MB (source image too), limit checked again after reduction
- Image rows show thumbnail; click opens full-screen viewer as stacked URL modal
- MCP tools: list, add (base64), delete (confirm) attachments; `delete_task` removes files
  - Files reached as `anon` with token in `x-mcp-token` header; storage policies resolve owner via `mcp_header_user()`; no service role key
  - MCP body cap raised to 8 MB
- Empty state follows icon/title/description/action; toast moves to top while popup open
- Prod: apply both migrations

---
ticket: VYB-271
scope: parka/time
summary: Upload MCP task attachments as raw bytes, not base64
why: An agent had to type the whole base64 into the call, so only tiny files fitted and evidence videos were lost
date: 2026-11-09
---

- New `POST /api/mcp/attachments/?taskId=&name=` takes the file as the body and its mime as `Content-Type`, with the same bearer token
  - Agent uses `curl --data-binary @file`, so the file never passes through the model
  - Same gateway call, rules (5 MB file, 20 MB video, 5 per task) and live refresh notice as `add_task_attachment`
- Chose one HTTP step over signed URL + PUT + confirm: the token already authenticates, no extra state or storage round trips
- Shared pre-checks (method, origin, rate limits, token shape) moved to one `admit` used by JSON-RPC and upload
- `add_task_attachment` description now sends agents to the upload endpoint for anything bigger than a few KB
- Proof: unit tests of the endpoint, real-backend e2e (3 MB+ video as raw bytes, stored size checked, bad type 400, bad token 401) and a recorded run on local Supabase

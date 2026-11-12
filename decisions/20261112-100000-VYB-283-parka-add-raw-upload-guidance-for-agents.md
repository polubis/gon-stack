---
ticket: VYB-283
scope: parka
summary: Point agents and factory spec to raw-bytes attachment upload
why: VYB-279 went done without its video because the agent thought base64 could not carry it, although the raw endpoint existed
date: 2026-11-12
---

- `add_task_attachment` description now says: few KB only, bigger goes to `/api/mcp/attachments/`, with a full curl example and a token warning
- Factory spec (`.nitpick/config.ts`, Evidence step) sends screenshots and video through the endpoint, forbids printing the token and forbids finished without required proof
- Chose docs plus spec over a new `upload_task_attachment_from_path` tool: the MCP server cannot read the agent filesystem, so curl is the only path
- Proof: unit test asserts the description carries endpoint, curl and token warning; mcp tests pass

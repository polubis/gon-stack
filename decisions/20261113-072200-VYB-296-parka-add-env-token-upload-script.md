---
ticket: VYB-296
scope: parka
summary: Binary proof goes through an env-token upload script
why: VYB-283 told agents to take the token "from MCP config"; classifier blocks that read, so agents fell back to add_task_attachment and tickets (VYB-289) ended Blocked
date: 2026-11-13
---

- Cause 1: spec said "Token from MCP config", the only token source is `~/.claude.json` (credential file, read denied) and no env var existed, so the curl route was unreachable by design
- Cause 2: evidence skill never mentions upload, tool description opened with base64 so MCP tool looked like the default
- Added `scripts/parka-upload.mjs`: token and url from `PARKA_MCP_URL`/`PARKA_MCP_TOKEN` env only, never printed, clear BLOCKED hint when env missing
- Factory spec, evidence skill and `add_task_attachment` description now say binary goes through the script, base64 tool only for few-KB text, no workaround when blocked
- Not done: allow rule `Bash(node scripts/parka-upload.mjs *)` and exporting the env vars need the owner (permission change refused for the agent)
- Proof: vitest delivers a 3 MB mp4 through the real upload handler, missing env and token leak cases covered

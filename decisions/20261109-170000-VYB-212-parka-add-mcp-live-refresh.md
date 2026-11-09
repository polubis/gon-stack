---
ticket: VYB-212
scope: parka/time
summary: Silently reload time and finance data after MCP writes
why: The app showed stale data after an MCP client changed tasks until the user reloaded
date: 2026-11-09
---

- MCP write tools call `mcp_notify_change` once done, which sends a Realtime broadcast on private topic `data-changes:<user id>`
  - Only the owner may read the topic (RLS on `realtime.messages`); a failed notice never fails the write
  - Every write tool announces `time`; `finance` is wired on the frontend for when MCP gets expense writes
- `/api/data-changes/events` relays the broadcast to the browser as SSE, like the attachments stream
- One tab holds a Web Lock and the stream, relays notices to the other tabs over `BroadcastChannel`; closing it hands the lock to the next tab
  - Browsers without Web Locks fall back to one stream per tab
- Time, dashboard and reports reload their current range or period quietly: no loading state, no error, shown data stays
  - A refresh meeting a write in flight is dropped and repeated by the write's end
- Proof: pgTAP, unit and integration tests, real-backend e2e with two tabs, evidence video in `.evidences/VYB-212`

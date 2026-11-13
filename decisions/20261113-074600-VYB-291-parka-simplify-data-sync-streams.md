---
ticket: VYB-291
scope: parka/data-sync
summary: Own SSE stream per tab, resync after phone unlock
why: Cross-tab leader lock plus BroadcastChannel relay dropped notices, so the time tab sometimes stayed stale.
date: 2026-11-13
tags: [realtime, sse]
---

- Removed navigator.locks leader election and BroadcastChannel relay in data-sync
  - Each tab opens its own EventSource, costs more connections but no lost relay
- Notice still carries only the domain, listeners refetch over REST
- Found second cause, locked phone leaves stream dead or frozen with no event
  - On visibilitychange, pageshow (bfcache) and online the stream is reopened and all domains reload
  - Browser-closed stream (readyState CLOSED) is reopened after 3 s
- Tests rewritten, cross-tab cases dropped, resume and reopen cases added

---
ticket: VYB-859
scope: parka/knowledge
summary: Read catalog media paths in one query on delete
why: Catalog delete read topic ids first, then reel files, two round trips for one list.
date: 2026-11-24
---

- Area: delete-knowledge-catalog, backend; not covered by VYB-849..858 (time, expenses, settings, recurring, limit-alerts, dashboard, attachments)
- `mediaPathsOfCatalog` now reads reels with inner join on topics filtered by catalog, one query
- Measured with fake timers, 25 ms per round trip: 125 ms before, 100 ms after (5 trips to 4)
- Owner filter kept on reels, RLS unchanged, same files removed, public response unchanged
- Test: latency, removed files, not found keeps files, no files skips storage; latency red on old code, green on new; application suites green (236)

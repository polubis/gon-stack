---
ticket: VYB-285
scope: parka/time
summary: Load all time tasks once, like finance, no per-range reads
why: Each week or month move refetched a range and prefetched neighbours; all tasks are read upfront so navigation is instant and request free.
date: 2026-11-12
tags: [parka, time, loading]
---

- GET /api/time now returns every task with a day when `from` is omitted; `to` only bounds recurring materialization
- Client reads once on entry; views already filter by period, so range moves need no request and no loading bar
- Prefetch of neighbour ranges and the `$loaded` range removed; `$horizon` (end of viewed year) marks how far rules are materialized
- Moving past the horizon reads again; recurring create, stale writes and MCP refresh reset and re-read everything
- Leaving the view clears cached reads; next visit starts clean
- Tradeoff: ending a series leaves its occurrences up to the horizon as ordinary tasks (before: only visited days); e2e updated
- `from` kept optional, so existing API callers with a range keep working
- Evidence on real Supabase, one video: main 10 reads over 12 week moves, branch 1 read

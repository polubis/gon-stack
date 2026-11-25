---
ticket: VYB-1036
scope: parka/recurring
summary: Run recurring series chunk writes in parallel
why: Series edit and delete waited chunk after chunk, so latency grew with series size; same writes can overlap.
date: 2026-11-25
tags: [performance, backend]
---

- area: `recurring-scope.ts` (deleteExpenses, editExpenses) and `time-scope.ts` (editTaskSeries, deleteTimeTasks); distinct from VYB-858 and PR #191
- change: chunks of 100 ids run via `Promise.all`; in editExpenses the update overlaps the items wipe and insert; per-chunk order kept for FK-safe deletes
- contract: no API change, same queries and round trips, same error mapping
- measure (25 ms fake trip, 500 ids): deleteExpenses 254 to 52 ms, editExpenses 379 to 51 ms, editTaskSeries 127 to 26 ms, deleteTimeTasks 255 to 51 ms
- tests: `series-scope-latency.test.ts` fails on old code; real-backend e2e 26 passed

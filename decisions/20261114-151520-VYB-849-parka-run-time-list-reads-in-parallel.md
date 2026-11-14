---
ticket: VYB-849
scope: parka/time
summary: Run time list reads and rule materialization in parallel
why: listTime and materializeTimeRecurring did serial round trips per rule and per query, so latency grew with rules.
date: 2026-11-14
tags: [performance, backend]
---

- Measured materialize with 8 rules at 25 ms per round trip: 432 ms before, 77 ms after
- materializeTimeRecurring now handles rules in parallel, upsert then forward-only mark kept per rule
- listTime starts profiles, categories, priorities, statuses and backlog reads at once, dated tasks still wait for materialization
- Response shape and endpoint contract unchanged
- Added time-materialize unit test with latency stand-in db

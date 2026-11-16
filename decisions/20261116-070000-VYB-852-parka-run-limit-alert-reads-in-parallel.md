---
ticket: VYB-852
scope: parka/limit-alerts
summary: Limit alerts overlap independent reads and writes, match items by map
why: notifyReachedLimits runs after every expense write; it waited on 4 sequential reads and one upsert per limit.
date: 2026-11-16
---

- Area picked: backend, expense write path (priority 2); VYB-849/850/851 took list-time, dashboard, expense writes, limit-alerts was untouched
- Before: limits, expenses, items, category names read one after another, then one notification upsert per limit in a loop
- Fix: category names read together with the month expenses; one upsert per limit run together; items grouped by expense id once instead of a filter per expense
  - Limits read stays first: no limits means no further reads, same as before
  - Items read stays after expenses, it needs their ids
- Measured in vitest, 25 ms per round trip, 600 expenses, 3000 items, 3 reached limits: 212 ms before, 105 ms after (3 runs each, stable), peak requests in flight 1 to 3
- Public behavior unchanged: same notification ids, payloads, never throws
- Test: latency test with overlap and wall time bound, plus category payload check
- tsc of the app has old unrelated errors (lib/target), not touched

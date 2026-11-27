---
ticket: VYB-862
scope: parka/recurring
summary: Recurring series edit and delete run chunks in parallel
why: Long series wrote chunk after chunk and read every rule's products, so latency grew with series length.
date: 2026-11-27
---

- Measured with fake 25 ms round trip, series of 250 occurrences (3 chunks of 100).
- Before: delete series 225 ms, edit series expenses 225 ms, rule split read 41 product rows for a rule with 1.
- After: delete series 100 ms, edit series expenses 75 ms, rule split reads 1 row.
- Chunks are independent: each keeps its own order (items before expenses), all run in parallel.
- Rule read in delete series starts with the series ids read; rule split reads products of that rule only.
- Public contract unchanged: same endpoints, inputs and outputs.
- Tests: recurring-scope-latency.test.ts asserts round-trip budget and rows read; failed before the change.

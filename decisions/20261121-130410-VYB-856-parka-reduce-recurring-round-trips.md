---
ticket: VYB-856
scope: parka/recurring
summary: Parallelize finance recurring materialization
why: Runs on every dashboard load; sequential per-rule round trips and repeated category reads made it grow linearly with rules.
date: 2026-11-21
tags: [performance, backend]
---

- materializeRecurring reads rules and products together, runs rules in parallel, reads category names once and lazily
- Fake 25 ms latency, 8 rules: 671 ms to 103 ms, 26 to 19 round trips
- Notification order kept by rule order; public API unchanged
- Measured with fake latency like time-materialize test, no real DB run

---
ticket: VYB-860
scope: parka/time
summary: Overlap unfinished-task reads in time list
why: Evening time list ran two dependent-free reads in series, adding needless round trips to every read.
date: 2026-11-25
tags: [performance, backend]
---

- notifyUnfinishedTasks read today's tasks and the open count one after another; now one Promise.all round trip
- listTime ran the unfinished check before the dated read; now both overlap, check still never fails the read
- Measured with fake db at 40 ms per trip: 130 ms / peak 1 in flight before, 87 ms / peak 2 after
- Public contract and notification payload unchanged
- Added time-unfinished-latency test (fails before, passes after); server vitest and real-backend rest e2e pass

---
ticket: VYB-1037
scope: parka/time
summary: Overlap device profiles read with time task writes
why: Four time task write procedures read profiles after the write, adding one needless round trip each.
date: 2026-11-25
tags: [perf, time]
---

- create-time-task, create-time-backlog-task, update-time-backlog-task, send-time-task-to-backlog start profiles read together with the write
- same pattern as update-time-task (VYB-857), no-op catch avoids unhandled rejection on failed write
- measured with 25 ms fixed latency per call: 53-58 ms before, 28-36 ms after, same 2 calls, response unchanged
- chose uncovered area, not notifyUnfinishedTasks (PR 191) nor recurring-scope/time-scope (PR 194)
- tests: new latency test per procedure, plus full server suite green

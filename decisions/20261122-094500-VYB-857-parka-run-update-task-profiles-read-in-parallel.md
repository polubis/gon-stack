---
ticket: VYB-857
scope: parka/time
summary: Overlap device profiles read with task update
why: update-time-task awaited device profiles after the write although they do not depend on it.
date: 2026-11-22
tags: [performance, time]
---

- update-time-task starts the device profiles read together with the write, response unchanged
  - failed write leaves no unhandled rejection from the early read
- latency test with 25 ms per call: 88-91 ms before, about 68 ms after, 3 calls both
- public API and schema untouched

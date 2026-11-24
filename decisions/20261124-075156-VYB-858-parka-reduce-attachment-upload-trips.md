---
ticket: VYB-858
scope: parka/time
summary: Overlap task and count reads in attachment upload
why: Two independent reads ran one after another, adding a needless database round trip to every upload.
date: 2026-11-24
tags: [performance, backend]
---

- uploadTaskAttachment reads task existence and attachment count with Promise.all
- not found still wins over conflict, same status codes and response body
- measured at 25 ms simulated latency per trip: 125 ms (5 trips) before, 100 ms (4 trips) after
- tests: latency bound, task missing returns 404, full task returns 409

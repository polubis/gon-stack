---
ticket: VYB-851
scope: parka/expenses
summary: Run independent reads beside the items write on expenses
why: Both procedures ran category names, items write, notifications, limits and device profiles one after another, so latency was the sum of every round trip.
date: 2026-11-16
tags: [parka, performance, backend, expenses]
---

- Areas touched earlier: VYB-849 list-time, VYB-850 dashboard; this one takes expense writes (most changed backend files)
- Category names and device profiles are read while the receipt items are written
  - Limit check still runs after items are stored and after the notification, order unchanged
- Public response, status codes and error mapping unchanged
- Measured with fake db, 25 ms per round trip, 1 item: create 186 -> 123 ms, update 255 -> 168 ms (about -34%)
- Tests: `expense-write-latency.test.ts` checks response shape and a latency ceiling
- Not done: merging notification insert with limit read, would change notification order

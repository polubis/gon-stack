---
ticket: VYB-850
scope: parka/dashboard
summary: Read dashboard receipt items with the period expenses only
why: getDashboard read every receipt item of the user, cut by the 1000-row cap, and matched them to expenses in a quadratic loop.
date: 2026-11-15
tags: [performance, backend]
---

- Measured on local Supabase, 4000 expenses with 12000 items, month window, 15 runs median
- Payload 96 KB to 59 KB recent window, 95 KB to 52 KB old window, rows 1171 to 684 and 1149 to 596
- Latency 11.8 ms to 9.4-11.1 ms recent, 8.4-10.3 ms to 8.3-10.1 ms old, small locally, round trip only
- Old read of all items is cut at 1000 rows: old window matched 0 items before, 447 after, category split was wrong
- Items now come embedded in the expenses select, one query fewer, no per-expense filter over all items
- Response shape and endpoint contract unchanged
- Typed the empty items fallback in limit-alerts, the embed made its union infer never
- Added get-dashboard unit test with query-recording db stand-in

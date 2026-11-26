---
ticket: VYB-861
scope: parka/recurring
summary: Read recurring rules and products together in list
why: List recurring read rules, then products, two sequential round trips for independent reads.
date: 2026-11-26
tags: [performance, backend]
---

- list-recurring reads rules and rule products in one Promise.all
- Public contract unchanged, errors still map through fromSupabaseError
- Latency test with fake 25 ms round trips: 3 rounds before, 2 after, with sign-in lookup
- Skipped recurring-scope and time-scope, open PR 194 owns them

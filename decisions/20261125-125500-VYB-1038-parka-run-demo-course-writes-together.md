---
ticket: VYB-1038
scope: parka/knowledge
summary: Overlap independent writes in create knowledge demo
why: Demo course creation ran 10 sequential round trips though category, tags and link inserts do not depend on each other.
date: 2026-11-25
tags: [performance, backend]
---

- category and tag lookup run together with Promise.all
- tag links and reels insert together after topics; builders settle, so no write runs after the failure cleanup
- public contract unchanged: same 200 and 201 bodies, same catalog cleanup on failure
- area picked: not touched by earlier perf PRs, backend endpoint
- measure at 25 ms per round trip: 250 ms before, 175 ms after
- tests: new latency test (budget, writes, cleanup, existing course), real-backend knowledge e2e passed

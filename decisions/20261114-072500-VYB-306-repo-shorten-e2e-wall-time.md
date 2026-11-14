---
ticket: VYB-306
scope: repo
summary: Shorten e2e wall time and isolate flaky real-backend specs
why: Playwright used half the cores and three real-backend specs were flaky, which also blocked running that project in parallel.
date: 2026-11-14
tags: [e2e, performance, playwright, flaky]
---

- Baseline on 4 cores: kdebek 39 to 41 s, talent-orbit 34 to 37 s, romantic-app 7 to 9 s, parka about 5.6 min
- `createPlaywrightConfig` sets `workers` to `max(2, cores)` instead of the default half of the cores
- parka `test:e2e` runs the fast project on all cores, then the real-backend project with `--no-deps` on 2 workers, so the wrangler process is not starved
- Real-backend project now runs fullyParallel on 2 workers after the flakes were fixed
- Result: kdebek 28 to 33 s, talent-orbit 23 to 29 s, romantic-app 7 s, parka 340 s to about 236 s, 3 of 3 consecutive full runs green
- rest-endpoints: the signed-in tab refetched on data-changes and charged the new rule before the test read it; the spec now leaves the app (about:blank) after sign-up. Failed 4 of 10 before, 0 of 20 after
- time.spec: one test took about 27 s of the 30 s limit; split into two tests with own accounts, timeout untouched
  - Escape pressed before focus entered the task menu was lost; the test now waits for focus and for the menu to close. 1 of 10 failed before, 0 of 40 after
- custom-statuses: the circle saves in the background; the spec polls the server for the done task instead of reading it once
- No retries, no longer timeouts, nothing skipped or deleted; product code unchanged, the live refetch is expected behaviour

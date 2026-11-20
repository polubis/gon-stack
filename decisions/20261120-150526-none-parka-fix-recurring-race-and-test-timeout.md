---
ticket: none
scope: parka
summary: Stabilize parka tests, fix recurring upsert race, add uih baseline
why: Pre-commit runs all suites in parallel, so slow jsdom tests hit the 5s default and fail while passing alone. uih visual test had only a win32 baseline, so Linux always failed.
date: 2026-11-20
tags: [testing, vitest, playwright]
---

- Parka vitest `testTimeout` 5s to 60s and maxWorkers 2; tests timed out under pre-commit CPU contention (4 cores), 20s was still not enough
- Added `button-scale-board-chromium-linux.png` beside the win32 baseline; uih e2e passes on Linux
- Local note: `astro preview` daemonizes when `CLAUDECODE` is set, so Playwright sees early exit; run e2e via turbo or unset it
- Hook e2e hit 500 duplicate `expenses_pkey` in `materializeRecurring`: upsert arbiter was the occurrence key, parallel request raced on pk; arbiter now `user_id,id` (same row, id is rule:day)
- `time.ts` upsert uses same occurrence-key arbiter; not changed, no failure seen

---
ticket: none
scope: parka/time-finance
summary: Animated swipe between periods with prefetch
why: Arrows were the only way to move and every step refetched reads that had not changed
date: 2026-10-24
tags: [parka, ux, time, finance, performance]
---

- `usePeriodSwipe` (shared/period-control): swipe left = next, right = previous, on the content wrapper of Czas (day/week/month/year) and the finance dashboard
  - content follows the finger (0.6x, fading), rubber band 0.2x where there is no next period
  - snaps back below the threshold; the new period slides in from the side of the gesture (also for the buttons and pickers via `go`)
  - no motion with `motion-reduce`
  - the whole `<main>` moves, its parent clips x overflow, so no layout shift
  - needs 64 px travel and a mostly horizontal move; ignored from inputs, sideways scrollers and modals (portals); no next past today in finance
  - prev/next buttons stay as the keyboard alternative
- `createRequestCache` (shared/request-cache): keyed reads, 30 s, shared in-flight, `prefetch` swallows errors; any write through `send` drops it (before and after), a fresh module mount resets it
- `neighbourPeriods`: 2 days around a day, 1 week/month/year around the rest, no future in finance
  - time `[TRIGGER]_LOAD` now carries `kind` (kept in `$range`); after a load it prefetches neighbours
  - dashboard loads the 4 period-independent reads (expenses, categories, limits, recurring) once, only the summary per period
- Abort signal dropped from `fetchTime` / `fetchDashboard`: shared reads must not be cancelled by one view
- Measured (mobile emulation, mocked API): a swipe or arrow step costs 0-1 requests in Czas and 0-1 in finance, was 1 and 5; avatar request per finance load is unchanged
- Tests: swipe, no repeated request for a prefetched neighbour, cache, `neighbourPeriods`; tests that read "the last request" now look for the range; vitest 879 pass, lint and `astro check` clean

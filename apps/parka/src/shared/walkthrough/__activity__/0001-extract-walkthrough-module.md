---
id: 0001
document: 0001-extract-walkthrough-module.md
module: shared/walkthrough
decision_ref: __decision__/0001-generic-walkthrough-engine.md
status: completed
---

# 0001 — extract generic walkthrough module

**Progress**: completed. Built full `configuration/domain/core/integration/presentation` module cloned from `user-profile-setup`, copied missing `src/libs/eda` into parka, added `rxjs`, rewired `home` to consume it, verified with unit tests + `astro check` + eslint + browser click-through (intro → next → next → last step → sign-up redirect).

**Time**: no single wall-clock start/end captured for coding portion — only checkpoints from tool output, local machine clock unless marked UTC:

- First green unit-test run: local `14:14:14` (2 files / 5 tests, 28.12s — slow, first Vitest run of session, cold deps).
- Hit dev-server bug (stale Vite pre-bundle after adding `rxjs` → duplicate-React "Invalid hook call"); killed + restarted process, cleared `.vite`/`.astro` cache.
- Browser verification (Playwright MCP snapshot filenames, UTC): first reload `12:17:45Z` (still broken/stale), working by `12:19:51Z` (post restart), full click-through redirect to `/sign-up/` at `12:20:34Z`.
- Local-vs-UTC offset: comparing later tasks (e.g. 0002 local `14:25:13` vitest vs `12:25:59Z` browser snapshot) gives consistent local = UTC+2. Inferred by correlation only, not verified against system clock.

Verification phase alone: roughly `12:17:45Z`–`12:20:34Z` (~3 min), including one dev-server restart. Total task time including coding before verification not instrumented, not estimated here.

**Cost**: not tracked. Environment exposes no per-task token or dollar-cost telemetry — `<total_tokens>` in system reminders is coarse non-monotonic remaining-budget counter (observed to increase between some turns), not per-task usage meter. Treat as unknown, not zero.

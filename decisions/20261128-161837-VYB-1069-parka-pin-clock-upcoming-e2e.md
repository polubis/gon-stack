---
ticket: VYB-1069
scope: parka/dashboard
summary: Freeze clock mid-month in upcoming-all e2e
why: Seed used today+1..+5 and the panel stops at month end, so the test failed in late month and blocked pre-commit.
date: 2026-11-28
---

- Cause: panel shows upcoming only inside the shown month, seed crossed into next month near month end
- Fix: page clock fixed to the 10th of current month, seed and backend anchored on that day
- Same pattern as flows.spec and dashboard-recalculation, no panel code change
- Scanned other e2e specs using todayDay, none depend on a month horizon

---
ticket: VYB-957
scope: parka/navigation
summary: Revert VYB-954 and VYB-956 nav changes back to VYB-950 state
why: Dev asked to undo both of today's main-nav changes; nav returns to state after VYB-950 (5215b42).
date: 2026-11-19
---

- Reverted c6ef4fc (VYB-956, glass bg/blur per state) and 981dec9 (VYB-954, floating nav slot) newest first
- Nav code, glass css and no-layout-shift e2e identical to 5215b42 again
- Kept VYB-954 and VYB-956 decision entries, history stays
